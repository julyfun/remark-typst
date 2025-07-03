import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from '../index.js'
import rehypeStringify from 'rehype-stringify'
import rehypeParse from 'rehype-parse'
import rehypeDocument from 'rehype-document'
import { read, write } from 'to-vfile'
import fs from 'node:fs/promises'

// Example markdown content with math expressions
const markdownContent = `# KaTeX Math Rendering Examples

This document demonstrates how to use rehype-katex to render mathematical expressions.

## Inline Math

The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.

Euler's identity: $e^{i\\pi} + 1 = 0$.

The area of a circle is $A = \\pi r^2$ where $r$ is the radius.

## Block Math

The Pythagorean theorem:

$$
a^2 + b^2 = c^2
$$

Integral example:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
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

## Fenced Code Math

You can also use fenced code blocks:

\`\`\`math
f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n
\`\`\`
`

// HTML content with math classes
const htmlContent = `<h1>Direct HTML Math Examples</h1>

<p>Inline math: <span class="math-inline">\\alpha + \\beta = \\gamma</span></p>

<p>Block math:</p>
<div class="math-display">\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}</div>

<p>Using code elements:</p>
<p>Inline: <code class="language-math math-inline">E = mc^2</code></p>

<pre><code class="language-math math-display">
F = G \\frac{m_1 m_2}{r^2}
</code></pre>`

// Basic example: Markdown to HTML with KaTeX
async function markdownToHtmlExample() {
  console.log('=== Markdown to HTML with KaTeX ===')
  
  const processor = unified()
    .use(remarkParse)
    .use(remarkMath)        // Parse math expressions in markdown
    .use(remarkRehype)      // Convert to HTML AST
    .use(rehypeKatex)       // Render math with KaTeX
    .use(rehypeStringify)   // Convert to HTML string
  
  const result = await processor.process(markdownContent)
  console.log('HTML output:')
  console.log(String(result))
  console.log('\n')
}

// HTML processing example
async function htmlProcessingExample() {
  console.log('=== Direct HTML Processing with KaTeX ===')
  
  const processor = unified()
    .use(rehypeParse, { fragment: true })  // Parse HTML fragment
    .use(rehypeKatex)                      // Render math with KaTeX
    .use(rehypeStringify)                  // Convert back to HTML
  
  const result = await processor.process(htmlContent)
  console.log('Processed HTML:')
  console.log(String(result))
  console.log('\n')
}

// Complete document example with CSS
async function completeDocumentExample() {
  console.log('=== Complete HTML Document with KaTeX CSS ===')
  
  const processor = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeDocument, {
      title: 'Math Examples',
      // Include KaTeX CSS for proper rendering
      css: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css'
    })
    .use(rehypeKatex)
    .use(rehypeStringify)
  
  const result = await processor.process(markdownContent)
  console.log('Complete HTML document:')
  console.log(String(result))
  console.log('\n')
}

// Configuration example with custom options
async function configurationExample() {
  console.log('=== KaTeX Configuration Example ===')
  
  // Custom macros for frequently used expressions
  const macros = {
    '\\RR': '\\mathbb{R}',
    '\\NN': '\\mathbb{N}',
    '\\ZZ': '\\mathbb{Z}',
    '\\QQ': '\\mathbb{Q}',
    '\\CC': '\\mathbb{C}'
  }
  
  const mathContent = 'Numbers: $\\NN \\subset \\ZZ \\subset \\QQ \\subset \\RR \\subset \\CC$'
  
  const processor = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex, {
      macros,                    // Custom macros
      errorColor: '#cc0000',     // Error color
      fleqn: false,              // Left-align equations
      leqno: false,              // Equation numbers on left
      trust: false               // Trust user input
    })
    .use(rehypeStringify)
  
  const result = await processor.process(mathContent)
  console.log('Result with custom configuration:')
  console.log(String(result))
  console.log('\n')
}

// Error handling example
async function errorHandlingExample() {
  console.log('=== Error Handling Example ===')
  
  const invalidMath = 'Invalid LaTeX: $\\invalidcommand{test}$'
  
  const processor = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex, {
      errorColor: 'orange',      // Color for error display
      // throwOnError: false is default, so errors are displayed instead of thrown
    })
    .use(rehypeStringify)
  
  const file = await processor.process(invalidMath)
  
  console.log('Result with error:')
  console.log(String(file))
  
  if (file.messages.length > 0) {
    console.log('\nError messages:')
    file.messages.forEach((message, index) => {
      console.log(`${index + 1}. ${message.message}`)
      if (message.cause) {
        console.log(`   Cause: ${message.cause}`)
      }
    })
  }
  console.log('\n')
}

// File processing example
async function fileProcessingExample() {
  console.log('=== File Processing Example ===')
  
  // Create temporary files
  const inputFile = 'temp-input.md'
  const outputFile = 'temp-output.html'
  
  await fs.writeFile(inputFile, markdownContent)
  
  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkMath)
      .use(remarkRehype)
      .use(rehypeDocument, {
        title: 'Math Document',
        css: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css'
      })
      .use(rehypeKatex)
      .use(rehypeStringify)
    
    const file = await processor.process(await read(inputFile))
    file.basename = outputFile
    await write(file)
    
    console.log(`Processed ${inputFile} and saved to ${outputFile}`)
    console.log('File contents:')
    const output = await fs.readFile(outputFile, 'utf8')
    console.log(output.substring(0, 500) + '...')
    
  } finally {
    // Clean up temporary files
    await fs.unlink(inputFile).catch(() => {})
    await fs.unlink(outputFile).catch(() => {})
  }
  console.log('\n')
}

// Advanced math examples
async function advancedMathExample() {
  console.log('=== Advanced Math Examples ===')
  
  const advancedContent = `# Advanced Mathematical Expressions

## Calculus

Derivative: $\\frac{d}{dx}[f(x)] = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$

$$
\\int_a^b f(x) dx = F(b) - F(a)
$$

## Linear Algebra

Eigenvalue equation: $A\\mathbf{v} = \\lambda\\mathbf{v}$

$$
\\det(A) = \\sum_{\\sigma \\in S_n} \\text{sgn}(\\sigma) \\prod_{i=1}^n a_{i,\\sigma(i)}
$$

## Statistics

Normal distribution: $f(x) = \\frac{1}{\\sqrt{2\\pi\\sigma^2}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$

$$
\\chi^2 = \\sum_{i=1}^n \\frac{(O_i - E_i)^2}{E_i}
$$

## Physics

Schrödinger equation: $i\\hbar\\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi$

$$
E = mc^2
$$`
  
  const processor = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex, {
      // Enable some advanced features
      trust: (context) => ['\\htmlId', '\\href'].includes(context.command),
      strict: false
    })
    .use(rehypeStringify)
  
  const result = await processor.process(advancedContent)
  console.log('Advanced math rendering:')
  console.log(String(result))
  console.log('\n')
}

// Run all examples
async function runAllExamples() {
  try {
    await markdownToHtmlExample()
    await htmlProcessingExample()
    await configurationExample()
    await errorHandlingExample()
    await fileProcessingExample()
    await advancedMathExample()
    
    // Note about complete document example
    console.log('Note: To run the complete document example, install rehype-document:')
    console.log('npm install rehype-document')
    console.log('Then uncomment the completeDocumentExample() call below.')
    // await completeDocumentExample()
    
    console.log('\n=== Usage Tips ===')
    console.log('1. Always include KaTeX CSS in your HTML for proper rendering')
    console.log('2. Use remark-math with rehype-katex for markdown processing')
    console.log('3. Configure macros for frequently used expressions')
    console.log('4. Handle errors gracefully with errorColor option')
    console.log('5. Use trust option carefully for security')
    
  } catch (error) {
    console.error('Error running examples:', error)
  }
}

// Run the examples
runAllExamples()