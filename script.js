"use strict";

    const url = "https://5ebbb8e5f2cfeb001697d05c.mockapi.io/users";
    const table = document.getElementById("table")

    const searchInput = document.getElementById("poisk")
    const clearBtn = document.getElementById("clean")

    const sortDate = document.getElementById("sortDate")
    const sortRating = document.getElementById("sortRating")

    const prevPageLink = document.getElementById("prevPage");
    const nextPageLink = document.getElementById("nextPage");

    let usersData = [];
    let currentPage = 1;// next
    const usersPerPage = 5; // prev
    let currentSortBy = null;
    let sortByDateAscending = true;
    let sortByRatingAscending = true;
    let currentUserIdToDelete = null;



    function displayUsers(users){
        const startIdx = (currentPage - 1) * usersPerPage;
        const endIdx = startIdx + usersPerPage;
        const usersToDisplay = users.slice(startIdx, endIdx);

        table.innerHTML = `<tr>
        <th>Имя пользователя</th>
            <th>E-mail</th>
            <th>Дата регистрации</th>
            <th>Рейтинг</th>
            <th></th>
        </tr>`;

        usersToDisplay.forEach(user =>{
            const row = document.createElement('tr')

            const cells = [
                `<td class="username">${user.username}</td>`,
                `<td>${user.email}</td>`,
                `<td>${user.registration_date}</td>`,
                `<td>${user.rating}</td>`,
                `<td><img class="close" src="cancel.svg" alt="delete"></td>`
            ];

            cells.forEach(cellText =>{
                const cell = document.createElement("td")
                if (cellText.includes("<img")) {
                    const img =  document.createElement("img")
                    img.className = "close";
                    img.addEventListener("click", () => {
                        currentUserIdToDelete = user.id;
                        deleteModal.style.display = "block";
                        disableOtherActivities()
                    });
                    img.src = "cancel.svg";
                    cell.appendChild(img);
                } else {
                    cell.innerHTML = cellText;
                    if (cellText.includes("username")) {
                        cell.classList.add("username")
                    }
                }
                row.appendChild(cell)
            })
                table.appendChild(row)
        })
    }


    function filterAndSortUsers(searchText) {
        let filteredUsers = usersData.filter(user => {
            return user.username.toLowerCase().includes(searchText.toLowerCase()) ||
                user.email.toLowerCase().includes(searchText.toLowerCase());
        });

        if (currentSortBy === "date") {
            filteredUsers = filteredUsers.sort((a, b) => {
                const dateA = new Date(a.registration_date);
                const dateB = new Date(b.registration_date);
                if (sortByDateAscending) {
                    return dateA - dateB;
                } else {
                    return dateB - dateA;
                }
            });
        } else if (currentSortBy === "rating") {
            filteredUsers = filteredUsers.sort((a, b) => {
                if (sortByRatingAscending) {
                    return a.rating - b.rating;
                } else {
                    return b.rating - a.rating;
                }
            });
        }

        displayUsers(filteredUsers);
    }

    fetch(url)
        .then(response => response.json())
        .then(users => {
            usersData = users;
            filterAndSortUsers("");
        })
        .catch(error => {
            console.error("Error:", error);
        });

    // Кнопка очистить фильтр
    clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        currentSortBy = null;
        filterAndSortUsers("");
        currentPage = 1;
        updatePaginationLinks();
    });
    // Строка Ввода
    searchInput.addEventListener("input", () => {
        filterAndSortUsers(searchInput.value);
        currentPage = 1;
        updatePaginationLinks();
    });

    // Сортировка по Дате
    sortDate.addEventListener("click", () => {
        if (currentSortBy === "date") {
            sortByDateAscending = !sortByDateAscending;
        } else {
            currentSortBy = "date";
            sortByDateAscending = true;
            sortRating.classList.remove("active");
        }
        sortDate.classList.add("active");
        filterAndSortUsers(searchInput.value);
        currentPage = 1;
        updatePaginationLinks();
    });

    // Сортировка по рейтингу
    sortRating.addEventListener("click", () => {
        if (currentSortBy === "rating") {
            sortByRatingAscending = !sortByRatingAscending;
        } else {
            currentSortBy = "rating";
            sortByRatingAscending = true;
            sortRating.classList.remove("active");
        }
        sortRating.classList.add("active");
        filterAndSortUsers(searchInput.value);
        currentPage = 1;
        updatePaginationLinks();
    });

    // Кнопка Предыдущая страница
    prevPageLink.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            filterAndSortUsers(searchInput.value);
            updatePaginationLinks();
        }
    });

    // Кнопка следующая страница
    nextPageLink.addEventListener("click", () => {
        const maxPage = Math.ceil(usersData.length / usersPerPage);
        if (currentPage < maxPage) {
            currentPage++;
            filterAndSortUsers(searchInput.value);
            updatePaginationLinks();
        }
    });

    function updatePaginationLinks() {
        const maxPage = Math.ceil(usersData.length / usersPerPage);

        prevPageLink.disabled = currentPage === 1;
        nextPageLink.disabled = currentPage === maxPage;

        if (currentPage === 1) {
            prevPageLink.style.display = "none";
        } else {
            prevPageLink.style.display = "inline";
        }

        if (currentPage === maxPage) {
            nextPageLink.style.display = "none";
        } else {
            nextPageLink.style.display = "inline";
        }
    }

    updatePaginationLinks();





    const deleteModal = document.getElementById("deleteModal");
    const yesButton = deleteModal.querySelector(".yes");
    const noButton = deleteModal.querySelector(".no");

    yesButton.addEventListener("click", () => {
        if (currentUserIdToDelete) {
            usersData = usersData.filter(user => user.id !== currentUserIdToDelete);
            handleUserDeletion(); 
            currentUserIdToDelete = null;
            deleteModal.style.display = "none";
            console.log('Yes')
        }
    });

    noButton.addEventListener("click", () => {
        currentUserIdToDelete = null;
        deleteModal.style.display = "none";
        enableOtherActivities()
        console.log('NO')

    });

    function disableOtherActivities() {
        table.style.pointerEvents = "none";
        searchInput.disabled = true;
        sortDate.style.pointerEvents = "none";
        sortRating.style.pointerEvents = "none";
        prevPageLink.style.pointerEvents = "none";
        nextPageLink.style.pointerEvents = "none";

        clearBtn.disabled = true;
        clearBtn.style.display = "none";
    }

    function enableOtherActivities() {
        table.style.pointerEvents = "auto";
        searchInput.disabled = false;
        sortDate.style.pointerEvents = "auto";
        sortRating.style.pointerEvents = "auto";
        prevPageLink.style.pointerEvents = "auto";
        nextPageLink.style.pointerEvents = "auto";

        clearBtn.disabled = false
        clearBtn.style.display = "block"; 

    }
    function handleUserDeletion() {
        filterAndSortUsers(searchInput.value);
        updatePaginationLinks();
        enableOtherActivities();
        clearBtn.disabled = false;
        clearBtn.style.display = "block";
    }
