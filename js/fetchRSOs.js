document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('rso-container');

    // Fetch RSOs
    fetch('api/fetchRSOs.php')
        .then(res => res.json())
        .then(async data => {
            if (data.success && Array.isArray(data.rsos)) {
                for (const rso of data.rsos) {
                    const universityName = await fetchUniversityName(rso.university_ID);
                    const adminName = await fetchAdminName(rso.admin_ID);

                    const rsoElement = document.createElement('div');
                    rsoElement.classList.add('rso-item');
                    rsoElement.innerHTML = `
                        <h3>${rso.name}</h3>
                        <p><strong>University:</strong> ${universityName}</p>
                        <p><strong>Admin:</strong> ${adminName}</p>
                        <p><strong>Status:</strong> ${rso.status}</p>
                        <p><strong>Created At:</strong> ${rso.created_at}</p>
                        <hr />
                    `;
                    container.appendChild(rsoElement);
                }
            } else {
                container.innerHTML = `<p>No RSOs found or an error occurred: ${data.error}</p>`;
            }
        })
        .catch(err => {
            container.innerHTML = `<p>Error fetching RSOs: ${err.message}</p>`;
        });

    // Helper to fetch university name
    async function fetchUniversityName(universityID) {
        try {
            const res = await fetch('api/fetchUniversity.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ university_ID: universityID })
            });
            const data = await res.json();
            return data.success ? data.university.name : 'Unknown University';
        } catch (err) {
            return 'Error fetching university';
        }
    }

    // Helper to fetch admin name
    async function fetchAdminName(adminID) {
        try {
            const res = await fetch('api/fetchUser.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ UID: adminID })
            });
            const data = await res.json();
            return data.success ? `${data.user.name}` : 'Unknown Admin';
        } catch (err) {
            return 'Error fetching admin';
        }
    }
});
