<script>
  import { base } from '$app/paths'
  import { page } from '$app/stores'

  import {GRAPH} from '$lib/ld.js'

  import './main.css';

  export let data

  $: urlParams = $page.url.search

</script>

<div class="app">
  <nav>
    <ul>
      <li> <a href="{base}/{urlParams}">Data</a> </li>
      <li> <a href="{base}/cards{urlParams}">Cards</a> </li>
      <li> <a href="{base}/trees{urlParams}">Trees</a> </li>
    </ul>
  </nav>

  <main>
    <slot />
  </main>

  <footer>
  </footer>
</div>

<style>
</style>
