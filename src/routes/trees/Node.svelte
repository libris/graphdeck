<script>
  import {ID, TYPE, asArray} from '$lib/ld.js'

  // TODO: remake as svelte component
  import { visualize } from '$lib/cards/visualizer.js'

  export let treeView
  export let node
  export let languages
  export let attop = false

  let nodebox
  let cardbox

  const numFmt = new Intl.NumberFormat()

  function getMatches () {
    const matchRels = [
      'owl:equivalentClass',
      'skos:exactMatch', 'skos:closeMatch', 'skos:broadMatch', 'skos:narrowMatch',
      'exactMatch', 'closeMatch', 'broadMatch', 'narrowMatch'
    ]
    const matches = []
    for (const rel of matchRels) {
      for (const match of asArray(node[rel])) {
        matches.push([rel, match])
      }
    }
    return matches
  }

  function getRevs(node) {
    return treeView.index.rev[node[ID]] || {}
  }

  function getChildren(node) {
    const revs = getRevs(node)
    return treeView.findUp(revs)
  }

  let revs = getRevs(node)
  let children = getChildren(node)

  let multibroader = treeView.hasMultipleParents(node)

  function getCssClass () {
    const id = node[ID]
    let cls = ''
    let collections = treeView.collectionRels.map(it => asArray(node[it])).flat()

    for (const coll of collections) {
      let cid = treeView.simpleNameFor(coll)
      cid = treeView.viewConfig[cid] || cid
      cls += ` ${cid}`
    }

    let type = node[TYPE]
    let styleForType = type
    if (type) {
      if (treeView.viewConfig[type]) {
        styleForType = treeView.viewConfig[type]
      }
    }
    if (styleForType) cls += ` ${styleForType}`

    if (multibroader) cls += ' multibroader'

    if (revs && treeView.findUp(revs).length) cls += ' parent'

    return cls
  }

  function getViewLinkFor (node) {
    if (!node[ID]) return null
    return treeView.index.expand(node[ID])
  }

  function showMultiples () {
    if (!multibroader) {
      return
    }
    const id = node[ID]
    for (const box of document.querySelectorAll(`[resource="${id}"]`)) {
      // window.scrollTo(box.offsetLeft, box.offsetTop)
      box.classList.add('targeted')
    }
  }

  function hideMultiples () {
    if (!multibroader) {
      return
    }
    const id = node[ID]
    for (const box of document.querySelectorAll(`[resource="${id}"]`)) {
      box.classList.remove('targeted')
    }
  }

  function toggleWide () {
    nodebox?.classList.toggle('wide')
  }

  function toggleClosed () {
    nodebox?.classList.toggle('closed')
  }

  let hoverOut = null

  function linkHoverOut () {
      if (hoverOut) {
        clearTimeout(hoverOut)
      }
      hoverOut = setTimeout(() => {
        cardbox.innerHTML = ''
        cardbox.style.visibility = 'hidden'
      }, 250)
  }

  function linkHover () {
    if (node) {
      if (hoverOut) {
        clearTimeout(hoverOut)
      }
      setTimeout(() => {
        cardbox.style.visibility = 'visible'
        visualize(cardbox, node)
      }, 50)
    }
  }

  function nestedCount(node) {
    const c = node['sample:count']
    let i = c != null ? c : 0
    const children = getChildren(node)
    if (children) {
      for (const child of children) {
        i += nestedCount(child)
      }
    }
    return i
  }
</script>

<div class={'node' + getCssClass()} id={attop ? node[ID] : null}
     resource={node[ID]}
     bind:this={nodebox}
     on:mouseover={showMultiples}
     on:mouseout={hideMultiples}>
  {#if children?.length && (!multibroader || attop)}
    <span class="closetoggle" on:click|self={toggleClosed}>-</span>
    <span class="widetoggle" on:click|self={toggleWide}>_</span>
  {/if}
  <b>
    <a href={getViewLinkFor(node)}>{treeView.getLabel(node, languages)}</a>
    <div bind:this={cardbox} class="cardbox"
         on:mouseover={linkHover} on:mouseout={linkHoverOut}></div>
    <aside>
      <span class="info-icon" on:mouseover={linkHover}
            on:mouseout={linkHoverOut}>&#9432;</span>
      {#each getMatches() as [rel, match]}
        <b title="">
          <a href={getViewLinkFor(match)}>{treeView.getLabel(match, languages)} <i>({rel})</i></a>
        </b>
      {/each}
    </aside>
  </b>
  {#if node['sample:count'] != null}
    {@const count = node['sample:count']}
    {@const nestcount = nestedCount(node)}
    {#if nestcount > count}
      <i class="count">{numFmt.format(count)} <b>({numFmt.format(nestcount)})</b></i>
    {:else}
      <i class="count">{numFmt.format(count)}</i>
    {/if}
  {/if}
  {#if children}
    <p>
      {#each children as child}
        {#if !multibroader || attop}
          <svelte:self {treeView} {languages} node={child}/>
        {/if}
      {/each}
    </p>
  {/if}
</div>
