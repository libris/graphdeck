import {ANNOTATION, GRAPH, ID, TYPE, LANGUAGE, VALUE, Index, asArray} from './ld.js'

const UP_RELATIONS = ['subClassOf', 'rdfs:subClassOf', 'broader', 'broadMatch']
const LABEL_PROPERTIES = ['prefLabel', 'skos:prefLabel', 'label', 'rdfs:label']

export class TreeView {
  constructor ({
    data = null,
    languages = ['en'],
    upRels = null,
    collectionRels = null
  }) {
    this.index = new Index(data)
    this.languages = languages
    this.upRels = upRels && upRels.length ? upRels : UP_RELATIONS
    this.collectionRels = collectionRels && collectionRels.length ? collectionRels : ['inCollection']
    this.viewConfig = {}
  }

  addGraph (source, url) {
    console.log(source)
    if (source.upRel) {
      this.upRels = asArray(source.upRel).map(it => it[ID])
      console.log(this.upRels)
    }
    if (source.collectionRel) {
      this.collectionRels = asArray(source.collectionRel).map(it => this.simpleNameFor(it))
    }
    if (source.view?.symbol) {
      for (const term of asArray(source.view.symbol)) {
        const className = this.simpleNameFor(term)
        const classStyleName = this.simpleNameFor(term[ANNOTATION].style)
        this.viewConfig[className] = classStyleName
      }
    }
    this.index.addData(source[GRAPH])
  }

  findTops () {
    let tops = []

    Object.values(this.index.index).forEach((node, i) => {
      if (!node[TYPE] || !node[ID] || node[ID].startsWith('_:')) {
        return
      }
      if (this.getTreeParents(node).length === 1) {
        return
      }
      tops.push(node)
    })

    const cmp = (a, b) => a && !b ? -1 : b && !a ? 1 : a < b ? -1 : a > b ? 1 : 0
    function cmpBy (a, b, ...keygetters) {
      let i = 0
      for (const getter of keygetters) {
        const i = cmp(getter(a), getter(b))
        if (i !== 0) return i
      }
      return i
    }

    const numberOfChildren = x => {
      const revs = this.index.rev[x[ID]]
      if (revs != null) {
        for (const upRel of this.upRels) {
          if (upRel in revs) {
            return revs[upRel].length
          }
        }
      }
      return null
    }

    tops.sort((a, b) => cmpBy(a, b,
        x => {
          const ups = this.findUp(x)
          return ups.length ? this.index[ups[0][ID]] : null
        },
        x => -numberOfChildren(x),
        x => x.inCollection,
        x => x[ID]
    ))

    return tops
  }

  findUp(node) {
    let parents = []
    for (const upRel of this.upRels) {
      if (upRel in node) {
        for (const parent of asArray(node[upRel])) {
          parents.push(parent)
        }
      }
    }
    return parents
  }

  isTreeNode(node) {
    return node[TYPE] != 'ConceptCollection' && this.getLabel(node) != null
  }

  getTreeParents(node) {
    return this.findUp(node).filter(
      x => ID in x && !x[ID].startsWith('_:') && x[ID] in this.index.index
    )
  }

  hasMultipleParents(node) {
    return this.getTreeParents(node).length > 1
  }

  getLabel (node, languages=this.languages) {
    for (const prop of LABEL_PROPERTIES) {
      if (prop in node) {
        let label = node[prop]
        if (label instanceof Object) {
          const labels = asArray(label)
          for (const lang of languages) {
            for (label of labels) {
              if (label[LANGUAGE] === lang) {
                return label[VALUE]
              }
            }
          }
          return label[VALUE]
        }
        return label
      }
    }
    return decodeURIComponent(node[ID])
  }

  simpleNameFor (item) {
    let id = typeof item === 'object' ? item[ID] : item.toString()
    const parts = id.split(/[#/:]([^#/:]+)$/)
    return parts.length == 3 ? parts[1] : id
  }

}
