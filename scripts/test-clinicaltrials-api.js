#!/usr/bin/env node
/**
 * Test script for ClinicalTrials.gov v2 API integration
 * Run with: node scripts/test-clinicaltrials-api.js
 */

const API_BASE_URL = 'https://clinicaltrials.gov/api/v2';

async function testSearchByCondition() {
    console.log('\n🔍 Testing search by condition (cancer)...\n');

    const params = new URLSearchParams({
        'query.cond': 'cancer',
        'pageSize': '5',
        'format': 'json'
    });

    const url = `${API_BASE_URL}/studies?${params.toString()}`;
    console.log('URL:', url);

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log('✅ Response received');
        console.log('Total studies found:', data.totalCount || 'N/A');
        console.log('Studies in this page:', data.studies?.length || 0);

        if (data.studies && data.studies.length > 0) {
            console.log('\nFirst study:');
            const study = data.studies[0];
            const protocol = study.protocolSection || {};
            const id = protocol.identificationModule || {};
            const status = protocol.statusModule || {};

            console.log('  NCT ID:', id.nctId);
            console.log('  Title:', id.briefTitle);
            console.log('  Status:', status.overallStatus);
        }

        return true;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

async function testFetchByNCT() {
    console.log('\n🔍 Testing fetch by NCT number (NCT05842967)...\n');

    const nctId = 'NCT05842967';
    const url = `${API_BASE_URL}/studies/${nctId}?format=json`;
    console.log('URL:', url);

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log('✅ Response received');

        const protocol = data.protocolSection || {};
        const id = protocol.identificationModule || {};
        const desc = protocol.descriptionModule || {};
        const status = protocol.statusModule || {};
        const design = protocol.designModule || {};

        console.log('\nStudy Details:');
        console.log('  NCT ID:', id.nctId);
        console.log('  Title:', id.briefTitle);
        console.log('  Status:', status.overallStatus);
        console.log('  Phase:', design.phases?.join(', ') || 'N/A');
        console.log('  Study Type:', design.studyType);
        console.log('  Summary:', desc.briefSummary?.substring(0, 100) + '...');

        return true;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

async function testSearchByPI() {
    console.log('\n🔍 Testing search by PI name (John Smith)...\n');

    const params = new URLSearchParams({
        'query.lead': 'John Smith',
        'pageSize': '5',
        'format': 'json'
    });

    const url = `${API_BASE_URL}/studies?${params.toString()}`;
    console.log('URL:', url);

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log('✅ Response received');
        console.log('Total studies found:', data.totalCount || 'N/A');
        console.log('Studies in this page:', data.studies?.length || 0);

        return true;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('='.repeat(60));
    console.log('ClinicalTrials.gov v2 API Integration Tests');
    console.log('='.repeat(60));

    const results = {
        searchByCondition: await testSearchByCondition(),
        fetchByNCT: await testFetchByNCT(),
        searchByPI: await testSearchByPI()
    };

    console.log('\n' + '='.repeat(60));
    console.log('Test Results:');
    console.log('='.repeat(60));
    console.log('Search by Condition:', results.searchByCondition ? '✅ PASS' : '❌ FAIL');
    console.log('Fetch by NCT:', results.fetchByNCT ? '✅ PASS' : '❌ FAIL');
    console.log('Search by PI:', results.searchByPI ? '✅ PASS' : '❌ FAIL');
    console.log('='.repeat(60));

    const allPassed = Object.values(results).every(r => r);
    if (allPassed) {
        console.log('\n🎉 All tests passed! API integration is working correctly.\n');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the errors above.\n');
    }
}

runTests().catch(console.error);
