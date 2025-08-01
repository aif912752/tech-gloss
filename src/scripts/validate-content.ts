// Build-time content validation script
import { getCollection } from 'astro:content';
import { validateAll } from '../utils/validation.ts';

/**
 * Validate all glossary content during build
 */
export async function validateContent() {
  console.log('🔍 Validating glossary content...');
  
  try {
    // Get all glossary entries
    const entries = await getCollection('glossary');
    
    if (entries.length === 0) {
      console.warn('⚠️  No glossary entries found');
      return { success: true, hasWarnings: true };
    }
    
    // Run validation
    const validation = validateAll(entries);
    
    // Print summary
    console.log(`\n📊 Validation Summary:`);
    console.log(`   Total entries: ${validation.totalEntries}`);
    console.log(`   Errors: ${validation.totalErrors}`);
    console.log(`   Warnings: ${validation.totalWarnings}`);
    
    // Print errors
    if (validation.errors.length > 0) {
      console.log('\n❌ Errors:');
      validation.errors.forEach(error => {
        console.log(`   ${error.entry}: ${error.message}`);
        if (error.suggestion && error.suggestion.length > 0) {
          console.log(`      Suggestions: ${error.suggestion.join(', ')}`);
        }
      });
    }
    
    // Print warnings
    if (validation.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      validation.warnings.forEach(warning => {
        console.log(`   ${warning.entry}: ${warning.message}`);
      });
    }
    
    // Print detailed results
    console.log('\n📋 Detailed Results:');
    
    // Related terms validation
    const relatedResult = validation.results.relatedTerms;
    console.log(`   Related Terms: ${relatedResult.errors.length} errors, ${relatedResult.warnings.length} warnings`);
    
    // Required fields validation
    const fieldsResult = validation.results.requiredFields;
    console.log(`   Required Fields: ${fieldsResult.errors.length} errors, ${fieldsResult.warnings.length} warnings`);
    
    // Content structure validation
    const contentResult = validation.results.contentStructure;
    console.log(`   Content Structure: ${contentResult.errors.length} errors, ${contentResult.warnings.length} warnings`);
    
    // Success/failure message
    if (validation.isValid) {
      if (validation.totalWarnings > 0) {
        console.log('\n✅ Validation passed with warnings');
        return { success: true, hasWarnings: true };
      } else {
        console.log('\n✅ All validations passed!');
        return { success: true, hasWarnings: false };
      }
    } else {
      console.log('\n❌ Validation failed!');
      console.log('Please fix the errors above before building.');
      return { success: false, hasWarnings: validation.totalWarnings > 0 };
    }
    
  } catch (error) {
    console.error('❌ Validation script failed:', error);
    return { success: false, hasWarnings: false };
  }
}

// Export validation results for use in other scripts
export async function getValidationResults() {
  const entries = await getCollection('glossary');
  return validateAll(entries);
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  validateContent().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}