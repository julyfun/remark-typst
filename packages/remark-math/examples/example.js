import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMath from '../index.js'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeKatex from 'rehype-katex'
import { read } from 'to-vfile'
import fs from 'node:fs/promises'

// Example markdown content with math expressions
const markdownContent = `# Math Examples

This document demonstrates various math expressions using remark-math.

## Inline Math

The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.

Euler's identity: $e^{i\\pi} + 1 = 0$.

The area of a circle is $A = \\pi r^2$ where $r$ is the radius.

## Block Math

The Pythagorean theorem:

$$
a^2 + b^2 = c^2
$$

Maxwell's equations:

$$
\\begin{align}
\\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\epsilon_0} \\\\
\\nabla \\cdot \\mathbf{B} &= 0 \\\\
\\nabla \\times \\mathbf{E} &= -\\frac{\\partial \\mathbf{B}}{\\partial t} \\\\
\\nabla \\times \\mathbf{B} &= \\mu_0 \\mathbf{J} + \\mu_0 \\epsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t}
\\end{align}
$$

## Matrix Example

$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
\\begin{pmatrix}
x \\\\
y
\\end{pmatrix}
=
\\begin{pmatrix}
ax + by \\\\
cx + dy
\\end{pmatrix}
$$
`

// Basic example: Parse math and convert to HTML
async function basicExample() {
  console.log('=== Basic Example: Markdown with Math to HTML ===')
  
  const processor = unified()
    .use(remarkParse)
    .use(remarkMath)        // Parse math expressions
    .use(remarkRehype)      // Convert to HTML AST
    .use(rehypeStringify)   // Convert to HTML string
  
  const result = await processor.process(markdownContent)
  console.log('HTML output:')
  console.log(String(result))
  console.log('\n')
}

// Advanced example: With KaTeX rendering
async function katexExample() {
  console.log('=== Advanced Example: With KaTeX Rendering ===')
  
  const processor = unified()
    .use(remarkParse)
    .use(remarkMath)        // Parse math expressions
    .use(remarkRehype)      // Convert to HTML AST
    .use(rehypeKatex)       // Render math with KaTeX
    .use(rehypeStringify)   // Convert to HTML string
  
  const result = await processor.process(markdownContent)
  console.log('HTML with KaTeX rendering:')
  console.log(String(result))
  console.log('\n')
}

// Configuration example: Disable single dollar text math
async function configExample() {
  console.log('=== Configuration Example: Disable Single Dollar Math ===')
  
  const testContent = `Single dollar: $x = 5$ should not be parsed.
Double dollar: $$y = 10$$ should still work.
Inline with double: $$z = 15$$ works too.`
  
  const processor = unified()
    .use(remarkParse)
    .use(remarkMath, { singleDollarTextMath: false })  // Disable single dollar
    .use(remarkRehype)
    .use(rehypeStringify)
  
  const result = await processor.process(testContent)
  console.log('Result with single dollar disabled:')
  console.log(String(result))
  console.log('\n')
}

// AST inspection example
async function astExample() {
  console.log('=== AST Example: Inspect Math Nodes ===')
  
  const simpleContent = 'Inline math: $\\alpha + \\beta$\n\n$$\\gamma = \\delta$$'
  
  const processor = unified()
    .use(remarkParse)
    .use(remarkMath)
  
  const tree = processor.parse(simpleContent)
  console.log('AST with math nodes:')
  console.log(JSON.stringify(tree, null, 2))
  console.log('\n')
}

// File processing example
async function fileExample() {
  console.log('=== File Processing Example ===')
  
  // Create a temporary markdown file
  const tempFile = 'temp-math.md'
  await fs.writeFile(tempFile, markdownContent)
  
  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkMath)
      .use(remarkRehype)
      .use(rehypeStringify)
    
    const file = await processor.process(await read(tempFile))
    console.log('Processed file result:')
    console.log(String(file))
  } finally {
    // Clean up
    await fs.unlink(tempFile).catch(() => {})
  }
}

// Run all examples
async function runExamples() {
  try {
    await basicExample()
    await configExample()
    await astExample()
    await fileExample()
    
    // Note: KaTeX example requires rehype-katex to be installed
    console.log('Note: To run the KaTeX example, install rehype-katex:')
    console.log('npm install rehype-katex')
    console.log('Then uncomment the katexExample() call below.')
    // await katexExample()
    
  } catch (error) {
    console.error('Error running examples:', error)
  }
}

// Run the examples
runExamples()