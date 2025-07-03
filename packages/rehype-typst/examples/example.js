import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeParse from 'rehype-parse'
import remarkTypst from '../../remark-typst/index.js'
import rehypeTypst from '../index.js'
import { read, write } from 'to-vfile'
import fs from 'node:fs/promises'

// Example markdown content with mixed Typst and LaTeX math
const markdownContent = `# Typst and LaTeX Math Rendering Examples

This document demonstrates how to use rehype-typst to render mathematical expressions using both Typst and LaTeX syntax.

## Typst Syntax Examples

### Basic Typst Math

Inline Typst math: $sum_(i=1)^n i = (n(n+1))/2$

Fractions in Typst: $a/b + c/d = (a d + b c)/(b d)$

Powers and subscripts: $x^2 + y_1^3 = z_(i j)$

### Display Typst Math

Integral example:
$$
integral_0^1 x^2 dif x = [x^3/3]_0^1 = 1/3
$$

Matrix in Typst:
$$
mat(
  a, b;
  c, d
) vec(x, y) = vec(a x + b y, c x + d y)
$$

Summation with Typst:
$$
sum_(k=1)^infinity 1/k^2 = pi^2/6
$$

## LaTeX Syntax Examples

### Basic LaTeX Math

Inline LaTeX math: $\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$

Fractions in LaTeX: $\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$

Greek letters: $\\alpha + \\beta = \\gamma$, $\\Delta = b^2 - 4ac$

### Display LaTeX Math

Integral example:
$$
\\int_0^1 x^2 dx = \\left[\\frac{x^3}{3}\\right]_0^1 = \\frac{1}{3}
$$

Matrix in LaTeX:
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

Maxwell's equations:
$$
\\begin{align}
\\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\epsilon_0} \\\\
\\nabla \\cdot \\mathbf{B} &= 0 \\\\
\\nabla \\times \\mathbf{E} &= -\\frac{\\partial \\mathbf{B}}{\\partial t} \\\\
\\nabla \\times \\mathbf{B} &= \\mu_0 \\mathbf{J} + \\mu_0 \\epsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t}
\\end{align}
$$

## Mixed Content

You can mix both syntaxes in the same document:
- Typst style: $alpha + beta = gamma$
- LaTeX style: $\\alpha + \\beta = \\gamma$
- Typst integral: $integral_(-infinity)^infinity e^(-x^2) dif x = sqrt(pi)$
- LaTeX integral: $\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$

## Fenced Code Math

You can also use fenced code blocks:

\`\`\`math
// Typst syntax
sum_(n=1)^infinity 1/n^2 = pi^2/6
\`\`\`

\`\`\`math
% LaTeX syntax
\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}
\`\`\`
`

// HTML content with math classes
const htmlContent = `<h1>Direct HTML Math Examples</h1>

<p>Inline Typst: <span class="math-inline">sum_(i=1)^n i^2</span></p>
<p>Inline LaTeX: <span class="math-inline">\\sum_{i=1}^n i^2</span></p>

<p>Block Typst math:</p>
<div class="math-display">integral_0^pi sin(x) dif x = 2</div>

<p>Block LaTeX math:</p>
<div class="math-display">\\int_0^\\pi \\sin(x) dx = 2</div>

<p>Using code elements:</p>
<p>Typst: <code class="language-math math-inline">E = m c^2</code></p>
<p>LaTeX: <code class="language-math math-inline">E = mc^2</code></p>

<pre><code class="language-math math-display">
// Typst syntax
F = G (m_1 m_2)/r^2
</code></pre>

<pre><code class="language-math math-display">
% LaTeX syntax
F = G \\frac{m_1 m_2}{r^2}
</code></pre>`

// Basic example: Markdown to HTML with Typst/LaTeX
async function markdownToHtmlExample() {
  console.log('=== Markdown to HTML with Typst/LaTeX ===')
  
  const processor = unified()
    .use(remarkParse)
    .use(remarkTypst)       // Parse math expressions in markdown
    .use(remarkRehype)      // Convert to HTML AST
    .use(rehypeTypst)       // Render math with Typst/KaTeX
    .use(rehypeStringify)   // Convert to HTML string
  
  const result = await processor.process(markdownContent)
  console.log('HTML output:')
  console.log(String(result))
  console.log('\n')
}

// HTML processing example
async function htmlProcessingExample() {
  console.log('=== Direct HTML Processing with Typst/KaTeX ===')
  
  const processor = unified()
    .use(rehypeParse, { fragment: true })  // Parse HTML fragment
    .use(rehypeTypst)                      // Render math with Typst/KaTeX
    .use(rehypeStringify)                  // Convert back to HTML
  
  const result = await processor.process(htmlContent)
  console.log('Processed HTML:')
  console.log(String(result))
  console.log('\n')
}

// Configuration example with different options
async function configurationExample() {
  console.log('=== Configuration Examples ===')
  
  // Example 1: Prefer Typst with LaTeX fallback
  console.log('--- Prefer Typst with LaTeX fallback ---')
  const processor1 = unified()
    .use(remarkParse)
    .use(remarkTypst)
    .use(remarkRehype)
    .use(rehypeTypst, {
      fallbackToLatex: true,     // Enable fallback to LaTeX
      preferTypst: true,         // Prefer Typst when ambiguous
      errorColor: '#ff6b6b'      // Error color
    })
    .use(rehypeStringify)
  
  const mixedContent = 'Mixed: $sum_(i=1)^n i$ and $\\sum_{i=1}^n i$'
  const result1 = await processor1.process(mixedContent)
  console.log('Result 1:', String(result1))
  
  // Example 2: Prefer LaTeX, no fallback
  console.log('\n--- Prefer LaTeX, no fallback ---')
  const processor2 = unified()
    .use(remarkParse)
    .use(remarkTypst)
    .use(remarkRehype)
    .use(rehypeTypst, {
      fallbackToLatex: false,    // Disable fallback
      preferTypst: false,        // Prefer LaTeX when ambiguous
      throwOnError: false        // Don't throw on errors
    })
    .use(rehypeStringify)
  
  const result2 = await processor2.process(mixedContent)
  console.log('Result 2:', String(result2))
  console.log('\n')
}

// Error handling example
async function errorHandlingExample() {
  console.log('=== Error Handling Examples ===')
  
  const invalidMath = `# Error Handling Demo

Valid Typst: $sum_(i=1)^n i$

Invalid Typst: $invalid_typst_command(test)$

Valid LaTeX: $\\sum_{i=1}^n i$

Invalid LaTeX: $\\invalidcommand{test}$`
  
  // With fallback enabled
  console.log('--- With fallback enabled ---')
  const processor1 = unified()
    .use(remarkParse)
    .use(remarkTypst)
    .use(remarkRehype)
    .use(rehypeTypst, {
      fallbackToLatex: true,
      errorColor: 'orange',
      throwOnError: false
    })
    .use(rehypeStringify)
  
  const file1 = await processor1.process(invalidMath)
  console.log('Result with fallback:')
  console.log(String(file1))
  
  if (file1.messages.length > 0) {
    console.log('\nMessages:')
    file1.messages.forEach((message, index) => {
      console.log(`${index + 1}. ${message.message}`)
    })
  }
  
  // Without fallback
  console.log('\n--- Without fallback ---')
  const processor2 = unified()
    .use(remarkParse)
    .use(remarkTypst)
    .use(remarkRehype)
    .use(rehypeTypst, {
      fallbackToLatex: false,
      errorColor: 'red',
      throwOnError: false
    })
    .use(rehypeStringify)
  
  const file2 = await processor2.process(invalidMath)
  console.log('Result without fallback:')
  console.log(String(file2))
  console.log('\n')
}

// Advanced math examples
async function advancedMathExample() {
  console.log('=== Advanced Math Examples ===')
  
  const advancedContent = `# Advanced Mathematical Expressions

## Typst Advanced Features

### Complex Fractions
$$
cfrac(1, 1 + cfrac(1, 2 + cfrac(1, 3 + cfrac(1, 4))))
$$

### Custom Functions
$$
f(x) = cases(
  x^2 "if" x >= 0,
  -x^2 "if" x < 0
)
$$

### Matrices and Vectors
$$
mat(
  1, 2, 3;
  4, 5, 6;
  7, 8, 9
) vec(x, y, z) = vec(a, b, c)
$$

## LaTeX Advanced Features

### Aligned Equations
$$
\\begin{align}
f(x) &= ax^2 + bx + c \\\\
f'(x) &= 2ax + b \\\\
f''(x) &= 2a
\\end{align}
$$

### Complex Expressions
$$
\\lim_{n \\to \\infty} \\left(1 + \\frac{1}{n}\\right)^n = e
$$

### Probability and Statistics
$$
P(A \\cap B) = P(A) \\cdot P(B|A)
$$

## Physics Examples

### Typst Physics
$$
E = m c^2
$$

$$
F = m a = m (dif^2 x)/(dif t^2)
$$

### LaTeX Physics
$$
\\hat{H}\\psi = E\\psi
$$

$$
\\nabla^2 \\phi - \\frac{1}{c^2} \\frac{\\partial^2 \\phi}{\\partial t^2} = 0
$$`
  
  const processor = unified()
    .use(remarkParse)
    .use(remarkTypst)
    .use(remarkRehype)
    .use(rehypeTypst, {
      fallbackToLatex: true,
      preferTypst: true
    })
    .use(rehypeStringify)
  
  const result = await processor.process(advancedContent)
  console.log('Advanced math rendering:')
  console.log(String(result))
  console.log('\n')
}

// File processing example
async function fileProcessingExample() {
  console.log('=== File Processing Example ===')
  
  // Create temporary files
  const inputFile = 'temp-typst-input.md'
  const outputFile = 'temp-typst-output.html'
  
  await fs.writeFile(inputFile, markdownContent)
  
  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkTypst)
      .use(remarkRehype)
      .use(rehypeTypst, {
        fallbackToLatex: true,
        preferTypst: true
      })
      .use(rehypeStringify)
    
    const file = await processor.process(await read(inputFile))
    file.basename = outputFile
    await write(file)
    
    console.log(`Processed ${inputFile} and saved to ${outputFile}`)
    console.log('File contents preview:')
    const output = await fs.readFile(outputFile, 'utf8')
    console.log(output.substring(0, 800) + '...')
    
  } finally {
    // Clean up temporary files
    await fs.unlink(inputFile).catch(() => {})
    await fs.unlink(outputFile).catch(() => {})
  }
  console.log('\n')
}

// Performance comparison example
async function performanceExample() {
  console.log('=== Performance Comparison ===')
  
  const testContent = `Performance test: $sum_(i=1)^n i^2$ vs $\\sum_{i=1}^n i^2$`
  
  // Test Typst-preferred processing
  console.time('Typst-preferred')
  const processor1 = unified()
    .use(remarkParse)
    .use(remarkTypst)
    .use(remarkRehype)
    .use(rehypeTypst, { preferTypst: true, fallbackToLatex: true })
    .use(rehypeStringify)
  
  await processor1.process(testContent)
  console.timeEnd('Typst-preferred')
  
  // Test LaTeX-preferred processing
  console.time('LaTeX-preferred')
  const processor2 = unified()
    .use(remarkParse)
    .use(remarkTypst)
    .use(remarkRehype)
    .use(rehypeTypst, { preferTypst: false, fallbackToLatex: false })
    .use(rehypeStringify)
  
  await processor2.process(testContent)
  console.timeEnd('LaTeX-preferred')
  console.log('\n')
}

// Syntax detection example
async function syntaxDetectionExample() {
  console.log('=== Syntax Detection Examples ===')
  
  const testCases = [
    { expr: 'sum_(i=1)^n i', expected: 'Typst' },
    { expr: '\\sum_{i=1}^n i', expected: 'LaTeX' },
    { expr: 'integral_0^1 x dif x', expected: 'Typst' },
    { expr: '\\int_0^1 x dx', expected: 'LaTeX' },
    { expr: 'alpha + beta', expected: 'Typst (ambiguous)' },
    { expr: '\\alpha + \\beta', expected: 'LaTeX' },
    { expr: 'mat(a, b; c, d)', expected: 'Typst' },
    { expr: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', expected: 'LaTeX' }
  ]
  
  console.log('Expression syntax detection:')
  testCases.forEach(({ expr, expected }) => {
    console.log(`"${expr}" -> ${expected}`)
  })
  console.log('\n')
}

// Run all examples
async function runAllExamples() {
  try {
    await markdownToHtmlExample()
    await htmlProcessingExample()
    await configurationExample()
    await errorHandlingExample()
    await advancedMathExample()
    await fileProcessingExample()
    await performanceExample()
    await syntaxDetectionExample()
    
    console.log('=== Usage Tips ===')
    console.log('1. rehype-typst supports both Typst and LaTeX syntax')
    console.log('2. Use fallbackToLatex: true for robust rendering')
    console.log('3. Typst syntax is more concise: sum_(i=1)^n vs \\sum_{i=1}^n')
    console.log('4. LaTeX syntax has broader compatibility')
    console.log('5. Mix both syntaxes in the same document as needed')
    console.log('6. Configure preferTypst based on your primary syntax')
    console.log('7. Handle errors gracefully with throwOnError: false')
    console.log('8. Include KaTeX CSS for proper LaTeX rendering')
    
  } catch (error) {
    console.error('Error running examples:', error)
  }
}

// Run the examples
runAllExamples()