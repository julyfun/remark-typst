import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkTypst from '../../remark-typst/index.js'
import rehypeTypst from '../index.js'

// Advanced configuration with custom options
const processor = unified()
  .use(remarkParse)
  .use(remarkTypst)
  .use(remarkRehype)
  .use(rehypeTypst, {
    // Typst-specific options
    fallbackToLatex: true,     // Fallback to KaTeX if Typst fails
    preferTypst: true,         // Prefer Typst for ambiguous expressions
    
    // KaTeX options (inherited)
    output: 'html',            // Output format
    leqno: false,             // Left-aligned equation numbers
    fleqn: false,             // Left-aligned equations
    throwOnError: false,      // Don't throw on math errors
    errorColor: '#cc0000',    // Error text color
    strict: 'warn',           // Strict mode
    trust: false,             // Trust user input
    macros: {                 // Custom LaTeX macros
      '\\RR': '\\mathbb{R}',
      '\\NN': '\\mathbb{N}'
    }
  })
  .use(rehypeStringify)

// Example with custom macros
const advancedMarkdown = `
# Advanced Math Examples

## Custom Macros
The real numbers $\\RR$ and natural numbers $\\NN$.

## Complex Expressions
Typst matrix:
$$
mat(
  1, 2, 3;
  4, 5, 6;
  7, 8, 9
)
$$

LaTeX matrix:
$$
\\begin{pmatrix}
1 & 2 & 3 \\\\
4 & 5 & 6 \\\\
7 & 8 & 9
\\end{pmatrix}
$$
`

processor.process(advancedMarkdown)
  .then(result => {
    console.log('Advanced rendering:')
    console.log(String(result))
  })
  .catch(error => {
    console.error('Advanced processing failed:', error)
  })