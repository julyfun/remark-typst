import assert from 'node:assert/strict'
import test from 'node:test'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {unified} from 'unified'
import remarkTypst from '../remark-typst/index.js'
import rehypeTypst from './index.js'

test('should render Typst math', async function () {
  const file = await unified()
    .use(remarkParse)
    .use(remarkTypst)
    .use(remarkRehype)
    .use(rehypeTypst)
    .use(rehypeStringify)
    .process('$sum_(i=1)^n i$')

  assert.match(String(file), /math/)
})

test('should render LaTeX math', async function () {
  const file = await unified()
    .use(remarkParse)
    .use(remarkTypst)
    .use(remarkRehype)
    .use(rehypeTypst)
    .use(rehypeStringify)
    .process('$\\sum_{i=1}^n i$')

  assert.match(String(file), /math/)
})

test('should handle mixed math types', async function () {
  const markdown = `
# 混合数学公式

行内 Typst: $sum_(i=1)^n i$

行内 LaTeX: $\\sum_{i=1}^n i$

块级 Typst:
$$
integral_0^1 x^2 dif x
$$

块级 LaTeX:
$$
\\int_0^1 x^2 dx
$$
`

  const file = await unified()
    .use(remarkParse)
    .use(remarkTypst)
    .use(remarkRehype)
    .use(rehypeTypst, {
      fallbackToLatex: true
    })
    .use(rehypeStringify)
    .process(markdown)

  const result = String(file)
  assert.match(result, /math/)
  // 应该包含渲染后的数学公式
  assert.ok(result.length > markdown.length)
})

test('should handle fallback options', async function () {
  const file = await unified()
    .use(remarkParse)
    .use(remarkTypst)
    .use(remarkRehype)
    .use(rehypeTypst, {
      fallbackToLatex: false,
      preferTypst: false
    })
    .use(rehypeStringify)
    .process('$\\sum_{i=1}^n i$')

  assert.match(String(file), /math/)
})

test('should handle error cases gracefully', async function () {
  const file = await unified()
    .use(remarkParse)
    .use(remarkTypst)
    .use(remarkRehype)
    .use(rehypeTypst)
    .use(rehypeStringify)
    .process('$invalid_math_expression$')

  const result = String(file)
  // Should still produce some output even with invalid math
  assert.ok(result.length > 0)
})