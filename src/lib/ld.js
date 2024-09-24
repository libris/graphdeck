export const ANNOTATION = '@annotation'
export const CONTEXT = '@context'
export const GRAPH = '@graph'
export const ID = '@id'
export const LANGUAGE = '@language'
export const TYPE = '@type'
export const VALUE = '@value'
export const VOCAB = '@vocab'

export function asArray(o) {
  return Array.isArray(o) ? o : o == null ? [] : [o]
}

export class Index {
  constructor (data = null) {
    this.context = {}
    this.index = {}
    this.rev = {}
    if (data) {
      this.addData(data)
    }
  }

  addData(data) {
    if (CONTEXT in data) Object.assign(this.context, data[CONTEXT])
    let items = data[GRAPH]
    this.fakeId = 0
    const revIndexed = {}
    this.visit(revIndexed, items)
    for (const [s, arcs] of Object.entries(revIndexed)) {
      if (this.rev[s] == null) this.rev[s] = {}
      for (const [revKey, subjectsById] of Object.entries(arcs)) {
        let subjects = this.rev[s][revKey]
        if (subjects == null) {
          subjects = this.rev[s][revKey] = []
        }
        subjects.push(...Object.values(subjectsById))
      }
    }
  }

  visit (revIndexed, items, link=null, from=null) {
    items.forEach((node, i) => {
      let s = node[ID]
      if (s == null) return
      if (/*!this.index[s] || */Object.keys(node).length > 1) {
        if (s in this.index) {
          this.mergeInto(this.index[s], node)
        } else {
          this.index[s] = node
        }
      }
      if (from) {
        let fromId = from[ID]
        if (fromId != null && fromId in this.index) {
          from = this.index[fromId]
        }
        let arcs = revIndexed[s]
        if (arcs == null) {
          arcs = revIndexed[s] = {}
        }
        let subjectsById = arcs[link]
        if (!subjectsById) {
          subjectsById = arcs[link] = {}
        }
        let byId = fromId != null ? fromId : fromId = '_:' + String(this.fakeId++)
        subjectsById[byId] = from
      }
      for (let p in node) {
        this.visit(revIndexed, asArray(node[p]), p, node)
      }
    })
  }

  mergeInto (intoNode, nodeData) {
    for (let [key, dataValue] of Object.entries(nodeData)) {
      let intoValue = intoNode[key]
      if (dataValue !== intoValue) {
        if (!Array.isArray(intoValue)) {
          intoValue = intoValue != null ? [intoValue] : []
          intoNode[key] = intoValue
        }
        if (!Array.isArray(dataValue)) {
          dataValue = [dataValue]
        }

        const idMap = intoValue.reduce((m, it) => {
          if (typeof it == 'object' && ID in it) m[it[ID]] = true
          return m
        }, {})

        for (const v of dataValue) {
          if (typeof v !== 'object' || !(ID in v) || !(v[ID] in idMap)) {
            intoValue.push(v)
          }
        }
      }
      if (intoValue.length === 1) {
        intoNode[key] = intoValue[0]
      }
    }
  }

  expand (id) {
    let [pfx, lname] = id.split(/:/)
    if (pfx == '') pfx = VOCAB
    if (pfx in this.context) {
      return this.context[pfx] + lname
    }
    return id
  }
}
