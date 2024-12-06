<script>
  import { base } from '$app/paths'
  import { page } from '$app/stores'

  import { GRAPH } from '$lib/ld.js'

  import './main.css';

  export let data

  $: urlParams = $page.url.search

</script>
<header>
  <nav>
    <ul>
      <li> <a href="{base}/{urlParams}">Data</a> </li>
      <li> <a href="{base}/cards{urlParams}">Cards</a> </li>
      <li> <a href="{base}/trees{urlParams}">Trees</a> </li>
    </ul>
  </nav>
</header>
  
<div class="app">


  <main>
    <slot />
  </main>
</div>
<footer>
  <h1>Color guide</h1>
  <ul>
    <li>Grå - klass</li>
    <li>Orange - form</li>
  </ul>
</footer>
<style>
</style>