// Add Schools to select
const schools = [
    "Amrita.V.H.S.S. Konni",
    "C.A.M.H.S. Kurumpakara",
    "Elamannoor H.S Elamannoor",
    "Govt H.S Kokkathode",
    "Govt H.S.S And V.H.S.S Kalanjoor",
    "Govt H.S.S Elimullumplackal",
    "Govt H.S.S Konni",
    "Govt H.S.S Mancode",
    "Govt H.S.S Thekkuthode",
    "Govt V.H.S.S Kaipattoor",
    "Govt V.H.S.S Koodal",
    "Govt. H.S Maroor",
    "Govt. H.S.S Chittar",
    "Govt. T H.S Kattachira",
    "J.M.P.H.S Malayalappuzha",
    "K.R.P.M.H.S.S. Seethathode",
    "Little Angels English Medium School, Chittar",
    "Marthoma High School Mekkozhoor",
    "Mount Bethany E.M.H.S.S Mylapra",
    "N.S.S H.S. Vallicode Kottayam",
    "Netaji High School Pramadom",
    "PSV P.M. H.S.S Iravon Konni",
    "Republican V.H.S.S Konni",
    "S.A.V.H.S Angamoozhy",
    "S.H.H.S.S Mylapra",
    "St George's Mount H S Kaipattoor",
    "St. George Asram H.S Chayalode Mangadu",
    "St. George H.S Oottupara",
    "St. George V.H.S.S Attachackal",
    "St. George's H.S Kizhavalloor",
    "St. Mary`s Residential E.M.H.S.S Mallassery",
    "St.Benedict`s M.S.C.H.S Thannithode",
    "V.K.N.M .V.H.S.S Vayyattupuzha",
    "None of the Above"
];

const schoolSelect = document.getElementById('school');
schools.forEach(school => {
    const option = document.createElement('option');
    option.value = school;
    option.textContent = school;
    schoolSelect.appendChild(option);
});

// Other School field is now permanently visible
const otherSchoolGroup = document.getElementById('otherSchoolGroup');

// File upload UI update
function updateFileUI(inputId, uiId) {
    const input = document.getElementById(inputId);
    const ui = document.getElementById(uiId);
    
    input.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const fileName = this.files[0].name;
            ui.querySelector('.text').textContent = fileName;
            ui.parentElement.classList.add('has-file');
        } else {
            ui.querySelector('.text').textContent = `Tap to upload ${inputId}`;
            ui.parentElement.classList.remove('has-file');
        }
    });
}

updateFileUI('photo', 'photo-ui');
updateFileUI('marksheet', 'marksheet-ui');

// Convert file to Base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove data:image/jpeg;base64, prefix
            let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
            if ((encoded.length % 4) > 0) {
                encoded += '='.repeat(4 - (encoded.length % 4));
            }
            resolve(encoded);
        };
        reader.onerror = error => reject(error);
    });
}

// Form Submission
const form = document.getElementById('studentForm');
const submitBtn = document.getElementById('submitBtn');
const statusMessage = document.getElementById('statusMessage');

// *** REPLACE THIS URL WITH YOUR GOOGLE APPS SCRIPT WEB APP URL ***
const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        statusMessage.textContent = "Please set the Google Apps Script Web App URL in script.js (Check instructions)";
        statusMessage.className = "status-message error";
        return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    statusMessage.textContent = "Uploading data and files... Please wait.";
    statusMessage.className = "status-message";

    try {
        const photoFile = document.getElementById('photo').files[0];
        const marksheetFile = document.getElementById('marksheet').files[0];

        const photoBase64 = photoFile ? await getBase64(photoFile) : null;
        const marksheetBase64 = marksheetFile ? await getBase64(marksheetFile) : null;

        const formData = {
            name: document.getElementById('name').value,
            address: document.getElementById('address').value,
            mobile: document.getElementById('mobile').value,
            whatsapp: document.getElementById('whatsapp').value,
            panchayat: document.getElementById('panchayat').value,
            standard: document.getElementById('standard').value,
            school: document.getElementById('school').value,
            otherSchool: document.getElementById('otherSchool').value,
            
            photoName: photoFile ? photoFile.name : "",
            photoMimeType: photoFile ? photoFile.type : "",
            photoData: photoBase64,
            
            marksheetName: marksheetFile ? marksheetFile.name : "",
            marksheetMimeType: marksheetFile ? marksheetFile.type : "",
            marksheetData: marksheetBase64
        };

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: {
                "Content-Type": "text/plain;charset=utf-8" // text/plain prevents CORS preflight issues
            }
        });

        // Try parsing JSON if possible
        try {
             const result = await response.json();
             if (result.status === "error") {
                 throw new Error(result.message);
             }
        } catch (jsonErr) {
            // Ignore if response is not JSON
        }

        document.getElementById('successModal').classList.add('active');
        form.reset();
        
        // Reset file UIs
        document.querySelectorAll('.file-upload-wrapper').forEach(el => el.classList.remove('has-file'));
        document.getElementById('photo-ui').querySelector('.text').textContent = "Tap to upload photo";
        document.getElementById('marksheet-ui').querySelector('.text').textContent = "Tap to upload mark sheet";

    } catch (error) {
        console.error(error);
        statusMessage.textContent = "An error occurred during submission. Please try again.";
        statusMessage.className = "status-message error";
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        if (!document.getElementById('successModal').classList.contains('active')) {
            statusMessage.textContent = "";
        }
    }
});
