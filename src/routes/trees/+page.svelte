<svelte:head>
  <title>GraphDeck: Trees</title>
  <style>
    @import url('./tree.css');
  </style>
</svelte:head>

<script lang="ts">
  import { page } from '$app/stores'

  import * as io from '$lib/io.js'
  import {GRAPH, asArray} from '$lib/ld.js'
  import {TreeView} from '$lib/tree.js'

  import Node from './Node.svelte'

  export let data

  let treeView
  let tops = []
  let thing

  let upRels = $page.url.searchParams.getAll('upRel')
  let collectionRels = $page.url.searchParams.getAll('collectionRel')

  let languages = ['sv', 'en'] // window.navigator.languages

  function toggleLanguage() {
    const swapped =languages[0]
    languages[0] = languages[1]
    languages[1] = swapped
  }

  treeView = new TreeView({upRels, collectionRels, languages})

  for (const url in data.selected) {
    const source = data.sourceById[url]
    treeView.addGraph(source, url)
  }

  tops = treeView.findTops()
  thing = null

function onKeyDown(evt) {
  if (evt.key === 'M' && evt.shiftKey) {
    for (let nodeEl of document.querySelectorAll('.node.parent')) {
      nodeEl.classList.add('closed')
    }
  }
  if (evt.key === 'R' && evt.shiftKey) {
    for (let nodeEl of document.querySelectorAll('.node.parent')) {
      nodeEl.classList.remove('closed')
    }
  }
}

</script>
<svelte:window on:keydown={onKeyDown} />
<nav>
  <ul>
    <li>
      <button on:click={toggleLanguage}>{languages[1]}</button>
    </li>
    <li>
      <button disabled>{languages[0]}</button>
    </li>
  </ul>
</nav>
<main>
  <article id="tree">
    {#each tops as node}
      {#if treeView.isTreeNode(node)}
        <section>
          <div>
            <Node {treeView} {node} {languages} attop={true} />
          </div>
        </section>
      {/if}
    {/each}
  </article>
</main>
<style>
  nav {
    position: absolute;
    top: 0em;
    right: 1em;
  }
</style>
