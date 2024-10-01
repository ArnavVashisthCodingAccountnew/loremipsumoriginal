import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import Base64 from 'base64-js';
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from './gemini-api-banner';
import './style.css';

// 🔥🔥 FILL THIS OUT FIRST! 🔥🔥
let API_KEY = 'AIzaSyACoQsgc8Kh4fciIcAsifpB85A5oty3Cy0';

let form = document.querySelector('#wireframeForm');
let imageInput = document.querySelector('#wireframeImage');
let descriptionInput = document.querySelector('textarea[name="description"]');
let languageSelect = document.querySelector('select[name="targetLanguage"]');
let output = document.querySelector('.output');

form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = 'Generating...';

  try {
    // Load the image as a base64 string
    let file = imageInput.files[0];
    let reader = new FileReader();
    
    reader.onload = async () => {
      let imageBase64 = reader.result.split(',')[1]; // Get base64 string

      // Assemble the prompt by combining the description with the chosen image and language
      let contents = [
        {
          role: 'user',
          parts: [
            { inline_data: { mime_type: 'image/png', data: imageBase64 } },
            { text: descriptionInput.value }, // User description
            { text: `Convert this screenshot to code in ${languageSelect.value}.` } // Instruction
          ]
        }
      ];

      // Call the multimodal model, and get a stream of results
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      });

      const result = await model.generateContentStream({ contents });

      // Read from the stream and interpret the output as markdown
      let buffer = [];
      let md = new MarkdownIt();
      for await (let response of result.stream) {
        buffer.push(response.text());
        output.innerHTML = md.render(buffer.join('')); // Render markdown output
      }

      // Convert the generated content to code based on the selected language
      let languageCode = languageSelect.value.toLowerCase().replace(/\s+/g, '-');
      let codeOutput = document.createElement('pre');
      codeOutput.className = 'code-output';
      codeOutput.textContent = generateCodeFromMarkdown(buffer.join(''), languageCode); // Get code from markdown

      output.appendChild(codeOutput);
    };

    reader.readAsDataURL(file); // Read the image file as a data URL
  } catch (e) {
    output.innerHTML += '<hr>' + e; // Display error messages
  }
};

// Function to extract code from markdown
function generateCodeFromMarkdown(markdown, language) {
  let lines = markdown.split('\n');
  let code = '';
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.startsWith('<code>')) {
      code += line.replace('<code>', '').replace('</code>', '') + '\n'; // Extract code from <code> tags
    } else {
      code += line + '\n';
    }
  }

  return `<pre><code class="${language}">${code}</code></pre>`; // Wrap code in <pre><code>
}

// You can delete this once you've filled out an API key
maybeShowApiKeyBanner(API_KEY);
