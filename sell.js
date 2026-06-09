let uploadedImages = [];
let imageIdCounter = 0;
let currentUser = null;

document.getElementById('registrationForm').style.display = 'block';

function registerUser() {
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const telegram = document.getElementById('regTelegram').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const agreed = document.getElementById('agreeCheck').checked;

    if (!name || !phone || !telegram || !email) {
        alert('Iltimos, barcha maydonlarni to\'ldiring!');
        return;
    }
    if (!agreed) {
        alert('Iltimos, qoidalar bilan tanishib, rozilik bildiring!');
        return;
    }

    currentUser = { name, phone, telegram, email };
    document.getElementById('registrationForm').style.display = 'none';
    document.getElementById('sellForm').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleImageUpload(event) {
    const files = event.target.files;
    const currentCount = document.querySelectorAll('.image-preview-item').length;
    const remaining = 6 - currentCount;

    if (remaining <= 0) {
        alert('Maksimal 6 ta rasm!');
        event.target.value = '';
        return;
    }

    if (files.length > remaining) {
        alert(`Faqat ${remaining} ta rasm qo'sha olasiz!`);
    }

    const filesToProcess = Math.min(files.length, remaining, 6 - uploadedImages.length);

    for (let i = 0; i < filesToProcess; i++) {
        const file = files[i];
        const reader = new FileReader();
        const fileId = imageIdCounter++;

        reader.onload = function(e) {
            uploadedImages.push({ id: fileId, src: e.target.result });

            const grid = document.getElementById('imagePreviewGrid');
            const placeholder = grid.querySelector('.upload-placeholder');

            const item = document.createElement('div');
            item.className = 'image-preview-item';
            item.dataset.imgId = fileId;
            item.innerHTML = `
                <img src="${e.target.result}" alt="Uploaded">
                <button class="remove-img" onclick="removeImage(this)">
                    <i class="bi bi-x"></i>
                </button>
            `;
            grid.insertBefore(item, placeholder);

            if (uploadedImages.length >= 6) {
                placeholder.style.display = 'none';
            }
        };
        reader.readAsDataURL(file);
    }
    event.target.value = '';
}

function removeImage(btn) {
    const item = btn.closest('.image-preview-item');
    const imgId = parseInt(item.dataset.imgId);
    item.remove();
    uploadedImages = uploadedImages.filter(img => img.id !== imgId);

    const placeholder = document.querySelector('.upload-placeholder');
    if (placeholder) {
        placeholder.style.display = 'flex';
    }
}

function submitAccount() {
    if (!currentUser) {
        alert('Iltimos, avval ro\'yxatdan o\'ting!');
        return;
    }

    const name = document.getElementById('accName').value.trim();
    const rank = document.getElementById('accRank').value;
    const level = document.getElementById('accLevel').value;
    const price = document.getElementById('accPrice').value;
    const desc = document.getElementById('accDesc').value.trim();

    if (!name || !rank || !level || !price || !desc) {
        alert('Iltimos, barcha maydonlarni to\'ldiring!');
        return;
    }

    if (price < 10000) {
        alert('Minimal narx 10 000 so\'m!');
        return;
    }

    if (uploadedImages.length === 0) {
        alert('Iltimos, kamida 1 ta rasm qo\'shing!');
        return;
    }

    const newAccount = {
        id: Date.now(),
        name: name,
        rank: rank,
        level: parseInt(level),
        price: parseInt(price),
        desc: desc,
        images: uploadedImages.map(img => img.src),
        seller: currentUser.telegram || currentUser.name,
        date: new Date().toISOString().split('T')[0]
    };

    let existing = JSON.parse(localStorage.getItem('dls26_accounts') || '[]');
    existing.unshift(newAccount);
    localStorage.setItem('dls26_accounts', JSON.stringify(existing));

    document.getElementById('sellForm').style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}