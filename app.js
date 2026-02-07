const fileInput = document.getElementById('fileInput');
const runBtn = document.getElementById('runBtn');
const endpoint = "http://localhost:5678/webhook/analyze-document";

// Helper function to show the "Email Sent" toast
function showEmailToast() {
    const toast = document.getElementById('emailToast');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

fileInput.addEventListener('change', e => {
    if (e.target.files.length > 0) {
        document.getElementById('fileName').textContent = e.target.files[0].name;
    }
});

runBtn.addEventListener('click', async () => {
    if (!fileInput.files[0]) return alert("Please upload a PDF");
    
    // UI Feedback
    runBtn.textContent = "Processing...";
    runBtn.disabled = true;
    document.getElementById('analysisBadge').textContent = "Analyzing...";
    document.getElementById('analysisBadge').style.background = "#fef3c7"; // Yellow

    const formData = new FormData();
    formData.append('data', fileInput.files[0]);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const res = await response.json();
        
        // 1. Update Extraction
        document.getElementById('title').textContent = res.extractionData?.title || "Untitled Document";
        const authors = res.extractionData?.authors || [];
        document.getElementById('authors').textContent = authors.length > 0 ? authors.join(', ') : "N/A";
        
        const topics = res.extractionData?.mainTopics || [];
        document.getElementById('topics').innerHTML = topics.map(t => `<span class="tag">${t}</span>`).join('');

        // 2. Update Stats
        document.getElementById('cTotal').textContent = res.citationData?.total ?? 0;
        document.getElementById('cValid').textContent = res.citationData?.valid ?? 0;
        document.getElementById('cInvalid').textContent = res.citationData?.invalid ?? 0;

        document.getElementById('pGrammar').textContent = res.proofreadingData?.grammar ?? 0;
        document.getElementById('pSpelling').textContent = res.proofreadingData?.spelling ?? 0;
        document.getElementById('pStyle').textContent = res.proofreadingData?.style ?? 0;

        // 3. Update Preview
        document.getElementById('reportPreview').innerHTML = res.htmlReport;
        document.getElementById('analysisBadge').textContent = "Complete";
        document.getElementById('analysisBadge').style.background = "#dcfce7"; // Green

        // 4. Trigger Email Notification Success
        showEmailToast();

    } catch (error) {
        console.error("Error:", error);
        document.getElementById('analysisBadge').textContent = "Error";
        document.getElementById('analysisBadge').style.background = "#fee2e2"; // Red
        alert("Workflow failed. Ensure n8n is running and CORS is enabled.");
    } finally {
        runBtn.textContent = "Analyze Document";
        runBtn.disabled = false;
    }
});