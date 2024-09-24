import {GRAPH, ID} from '$lib/ld.js'
import * as io from '$lib/io.js'

export const ssr = false

export async function load(pageLoad) {
  const indexData = await io.load('data/index.ttl')

  const sourceById = {}
  let settingItems = {}

  for (const source of indexData[GRAPH]) {
    const id = source[ID]
    if (id.startsWith('#')) {
      settingItems[id] = source
      continue
    }
    sourceById[id] = source
  }
  for (const source of Object.values(sourceById)) {
    if (source.view) {
      let item = settingItems[source.view[ID]]
      if (item) {
        source.view = item
      }
    }
  }

  const urls = pageLoad.url.searchParams.getAll('url')
  const selected = {}

  for (const url of urls) {
    selected[url] = true
    if (sourceById[url] == null) {
      sourceById[url] = {[ID]: url}
    }
  }

  await Promise.all(Object.keys(selected).map(async url => {
    const source = sourceById[url]
    if (!(GRAPH in source)) {
      source[GRAPH] = await io.load(source[ID] + '?cachebust=' + new Date().getTime().toString(16))
    }
  }))

  return {
    selected,
    sourceById
  }
}
