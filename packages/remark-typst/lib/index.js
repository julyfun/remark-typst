/**
 * @import {Root} from 'mdast'
 * @import {Options} from 'remark-typst'
 * @import {} from 'remark-parse'
 * @import {} from 'remark-stringify'
 * @import {Processor} from 'unified'
 */

import {mathFromMarkdown, mathToMarkdown} from 'mdast-util-math'
import {math} from 'micromark-extension-math'
import {visit} from 'unist-util-visit'

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
 * 访问数学节点并添加类型信息
 * @param {any} node - AST 节点
 */
function visitMath(node) {
  if (node.type === 'math' || node.type === 'inlineMath') {
    node.data = node.data || {}
    node.data.mathType = detectMathType(node.value)
  }
}

/**
 * Add support for math with Typst and LaTeX detection.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns {undefined}
 *   Nothing.
 */
export default function remarkTypst(options) {
  // @ts-expect-error: TS is wrong about `this`.
  // eslint-disable-next-line unicorn/no-this-assignment
  const self = /** @type {Processor<Root>} */ (this)
  const settings = options || emptyOptions
  const data = self.data()

  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = [])
  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = [])
  const toMarkdownExtensions =
    data.toMarkdownExtensions || (data.toMarkdownExtensions = [])

  micromarkExtensions.push(math(settings))
  fromMarkdownExtensions.push(mathFromMarkdown())
  toMarkdownExtensions.push(mathToMarkdown(settings))
  
  // 添加数学类型检测的转换器
  return function (tree) {
    visit(tree, ['math', 'inlineMath'], visitMath)
  }
}