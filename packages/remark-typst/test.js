import assert from 'node:assert/strict'
import test from 'node:test'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkStringify from 'remark-stringify'
import {unified} from 'unified'
import {removePosition} from 'unist-util-remove-position'
import remarkTypst from './index.js'

test('should parse Typst math', async function () {
  const file = await unified()
    .use(remarkParse)
    .use(remarkTypst)
    .use(remarkStringify)
    .process('$sum_(i=1)^n i$')

  assert.equal(String(file), '$sum_(i=1)^n i$\n')
})

test('should parse LaTeX math', async function () {
  const file = await unified()
    .use(remarkParse)
    .use(remarkTypst)
    .use(remarkStringify)
    .process('$\\sum_{i=1}^n i$')

  assert.equal(String(file), '$\\sum_{i=1}^n i$\n')
})

test('should detect math types', async function () {
  const processor = unified()
    .use(remarkParse)
    .use(remarkTypst)

  const typstTree = processor.parse('$sum_(i=1)^n i$')
  const latexTree = processor.parse('$\\sum_{i=1}^n i$')
  
  await processor.run(typstTree)
  await processor.run(latexTree)
  
  // 验证数学类型检测 - 修复类型错误
  // 数学节点在段落的第一个子节点中
  const typstMathNode = typstTree.children[0].children[0]
  const latexMathNode = latexTree.children[0].children[0]
  
  assert.equal(typstMathNode.data?.mathType, 'typst')
  assert.equal(latexMathNode.data?.mathType, 'latex')
})

test('should handle display math', async function () {
  const file = await unified()
    .use(remarkParse)
    .use(remarkTypst)
    .use(remarkStringify)
    .process('$$\nintegral_0^1 x^2 dif x\n$$')

  assert.equal(String(file), '$$\nintegral_0^1 x^2 dif x\n$$\n')
})

test('should handle mixed math content', async function () {
  const markdown = `# 混合数学公式

行内 Typst: $sum_(i=1)^n i$

行内 LaTeX: $\\sum_{i=1}^n i$`
  
  const file = await unified()
    .use(remarkParse)
    .use(remarkTypst)
    .use(remarkStringify)
    .process(markdown)

  const result = String(file)
  assert.ok(result.includes('$sum_(i=1)^n i$'))
  assert.ok(result.includes('$\\sum_{i=1}^n i$'))
})