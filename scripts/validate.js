// Content validation script for build process
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 Running content validation...');

try {
  // Check if content directory exists
  const contentDir = join(process.cwd(), 'src', 'content', 'glossary');
  if (!existsSync(contentDir)) {
    console.error('❌ Content directory not found:', contentDir);
    process.exit(1);
  }

  // Get all markdown files
  const { globSync } = await import('glob');
  const markdownFiles = globSync('src/content/glossary/*.{md,mdx}');
  
  console.log(`📄 Found ${markdownFiles.length} glossary entries`);
  
  let errors = 0;
  let warnings = 0;
  
  // Basic validation for each file
  markdownFiles.forEach(file => {
    try {
      const content = readFileSync(file, 'utf-8');
      const filename = file.split(/[/\\]/).pop().replace(/\.(md|mdx)$/, '');
      
      // Check frontmatter (handle different line endings)
      const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!frontmatterMatch) {
        console.error(`❌ ${filename}: Missing frontmatter`);
        errors++;
        return;
      }
      
      const frontmatter = frontmatterMatch[1];
      
      // Check required fields
      const requiredFields = ['title', 'description', 'category'];
      requiredFields.forEach(field => {
        if (!frontmatter.includes(`${field}:`)) {
          console.error(`❌ ${filename}: Missing required field '${field}'`);
          errors++;
        }
      });
      
      // Check for empty content
      const bodyContent = content.replace(frontmatterMatch[0], '').trim();
      if (!bodyContent) {
        console.warn(`⚠️  ${filename}: Empty content body`);
        warnings++;
      }
      
      // Check for broken internal links
      const internalLinks = bodyContent.match(/\[([^\]]+)\]\(\/glossary\/([^)]+)\)/g);
      if (internalLinks) {
        internalLinks.forEach(link => {
          const match = link.match(/\[([^\]]+)\]\(\/glossary\/([^)]+)\)/);
          if (match) {
            const linkedSlug = match[2];
            const linkedFile = join(process.cwd(), 'src', 'content', 'glossary', `${linkedSlug}.mdx`);
            if (!existsSync(linkedFile)) {
              console.error(`❌ ${filename}: Broken internal link to '${linkedSlug}'`);
              errors++;
            }
          }
        });
      }
      
    } catch (error) {
      console.error(`❌ ${filename}: Error reading file -`, error.message);
      errors++;
    }
  });
  
  // Summary
  console.log('\n📊 Validation Summary:');
  console.log(`   Files checked: ${markdownFiles.length}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Warnings: ${warnings}`);
  
  if (errors > 0) {
    console.log('\n❌ Validation failed! Please fix the errors above.');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n✅ Validation passed with warnings.');
  } else {
    console.log('\n✅ All validations passed!');
  }
  
} catch (error) {
  console.error('❌ Validation script failed:', error.message);
  process.exit(1);
}