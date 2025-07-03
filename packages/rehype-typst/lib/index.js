/**
 * @import {ElementContent, Root} from 'hast'
 * @import {KatexOptions} from 'katex'
 * @import {VFile} from 'vfile'
 */

/**
 * @typedef {Object} TypstOptions
 * @property {boolean} [fallbackToLatex=true] - 当 Typst 渲染失败时是否回退到 LaTeX
 * @property {boolean} [preferTypst=true] - 是否优先使用 Typst 渲染
 */

/**
 * @typedef {Omit<KatexOptions, 'displayMode' | 'throwOnError'> & TypstOptions} Options
 */

import {fromHtmlIsomorphic} from 'hast-util-from-html-isomorphic'
import {toText} from 'hast-util-to-text'
import katex from 'katex'
import {visit} from 'unist-util-visit'
import wypst from 'wypst'

/** @type {Readonly<Options>} */
const emptyOptions = {}

/**
 * 检测数学表达式的类型
 * @param {string} value - 数学表达式内容
 * @returns {'latex' | 'typst'} 数学类型
 */
function detectMathType(value) {
  // 检测 LaTeX 命令（反斜杠开头的命令）
  const latexPattern = /\\\S/
  if (latexPattern.test(value)) {
    return 'latex'
  }
  
  // 检测 LaTeX 环境
  const envPattern = /\\begin\{[^}]+\}/
  if (envPattern.test(value)) {
    return 'latex'
  }
  
  // 检测常见的 LaTeX 符号
  const latexSymbols = /\\(frac|sum|int|prod|sqrt|alpha|beta|gamma|delta|theta|lambda|mu|pi|sigma|phi|psi|omega)/
  if (latexSymbols.test(value)) {
    return 'latex'
  }
  
  // 默认为 Typst
  return 'typst'
}

/**
 * Render elements with math classes using Typst or KaTeX.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export default function rehypeTypst(options = {}) {
  const settings = {
    fallbackToLatex: true,
    ...options
  }

  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   * @returns {Promise<undefined>}
   *   Nothing.
   */
  return async function (tree) {
    // 初始化 Typst 渲染器
    await wypst.init()
    
    visit(tree, ['element'], (node) => {
      if (node.tagName === 'code' && node.properties?.className?.includes('language-math')) {
        // 处理代码块中的数学表达式
        const mathContent = toText(node, {whitespace: 'pre'})
        const mathType = node.data?.mathType || detectMathType(mathContent)
        const isDisplay = true // 代码块默认为显示模式
        
        try {
          let rendered
          if (mathType === 'latex') {
            // 使用 KaTeX 渲染 LaTeX
            rendered = katex.renderToString(mathContent, {
              displayMode: isDisplay,
              throwOnError: false
            })
          } else {
            // 使用 Typst 渲染
            rendered = wypst.renderToString(mathContent, {
              displayMode: isDisplay
            })
          }
          
          // 将渲染结果转换为 HTML 节点
          const root = fromHtmlIsomorphic(rendered, {fragment: true})
          const parent = node.parent
          if (parent && parent.tagName === 'pre') {
            // 替换整个 pre 元素
            const grandParent = parent.parent
            if (grandParent) {
              const index = grandParent.children.indexOf(parent)
              grandParent.children.splice(index, 1, ...root.children)
            }
          }
        } catch (error) {
          // 错误处理和回退机制
          if (settings.fallbackToLatex && mathType === 'typst') {
            try {
              const fallback = katex.renderToString(mathContent, {
                displayMode: isDisplay,
                throwOnError: false
              })
              const root = fromHtmlIsomorphic(fallback, {fragment: true})
              const parent = node.parent
              if (parent && parent.tagName === 'pre') {
                const grandParent = parent.parent
                if (grandParent) {
                  const index = grandParent.children.indexOf(parent)
                  grandParent.children.splice(index, 1, ...root.children)
                }
              }
            } catch {
              // 显示错误信息
              node.children = [{
                type: 'element',
                tagName: 'span',
                properties: { style: 'color: red;' },
                children: [{ type: 'text', value: error.message }]
              }]
            }
          }
        }
      } else if (node.properties?.className?.includes('math-inline') || 
                 node.properties?.className?.includes('math-display')) {
        // 处理行内和块级数学表达式
        const mathContent = toText(node, {whitespace: 'pre'})
        const mathType = node.data?.mathType || detectMathType(mathContent)
        const isDisplay = node.properties.className.includes('math-display')
        
        try {
          let rendered
          if (mathType === 'latex') {
            // 使用 KaTeX 渲染 LaTeX
            rendered = katex.renderToString(mathContent, {
              displayMode: isDisplay,
              throwOnError: false
            })
          } else {
            // 使用 Typst 渲染
            rendered = wypst.renderToString(mathContent, {
              displayMode: isDisplay
            })
          }
          
          // 将渲染结果转换为 HTML 节点
          const root = fromHtmlIsomorphic(rendered, {fragment: true})
          node.children = root.children
        } catch (error) {
          // 错误处理和回退机制
          if (settings.fallbackToLatex && mathType === 'typst') {
            try {
              const fallback = katex.renderToString(mathContent, {
                displayMode: isDisplay,
                throwOnError: false
              })
              const root = fromHtmlIsomorphic(fallback, {fragment: true})
              node.children = root.children
            } catch {
              node.children = [{
                type: 'element',
                tagName: 'span',
                properties: { style: 'color: red;' },
                children: [{ type: 'text', value: error.message }]
              }]
            }
          }
        }
      }
    })
  }
}