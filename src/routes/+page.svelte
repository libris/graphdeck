<script>
  import { preloadData, pushState, goto } from '$app/navigation'
  import { base } from '$app/paths'
  import { page } from '$app/stores'

  import {GRAPH, ID} from '$lib/ld.js'
  import * as io from '$lib/io.js'

  export let data

  let sources = []

  for (const url in data.selected) {
    sources.push(data.sourceById[url])
  }

  async function selectChange() {
    const current = {}
    for (const source of sources) {
      current[source[ID]] = true
      data.selected[source[ID]] = true
    }
    for (const old in data.selected) {
      if (!(old in current)) {
        delete data.selected[old][GRAPH]
        delete data.selected[old]
      }
    }

    const stateUrl = base + $page.route.id + reprState()
    let result = await preloadData(stateUrl)
    goto(stateUrl)
    if (result.type === 'loaded' && result.status === 200) {
      data = result.data
      // TODO: pushState doesn't rerender layout (but goto does)!
      goto(stateUrl, {keepfocus: true})
    //} else {
    //  goto(stateUrl)
    }
  }

  function reprState() {
    const urlparams = []
    for (const sourceId in data.selected) {
      const source = data.sourceById[sourceId]
      urlparams.push(`url=${sourceId}`)
    }
    return urlparams.length > 0 ? '?' + urlparams.join('&') : ''
  }
</script>
<svelte:head>
  <title>GraphDeck: Main</title>
</svelte:head>

<section>
  <p>Load data:</p>
  <select size="42" multiple bind:value={sources} on:change={selectChange}>
    {#each Object.entries(data.sourceById) as [sourceId, source]}
      <option value={source} class={sourceId in data.selected}>
        {sourceId}
        {#if sourceId in data.selected}[x]{/if}
      </option>
    {/each}
  </select>
  {#each sources as source}
    {#if '@graph' in source}
      <textarea cols="80" rows="20">{io.toTrig(source['@graph'])}</textarea>
    {/if}
  {/each}
</section>
