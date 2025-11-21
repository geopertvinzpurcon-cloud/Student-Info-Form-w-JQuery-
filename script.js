// Handle Gender Selection Animation
const genderSelect = document.getElementById("genderSelect");
const otherContainer = document.getElementById("otherGenderContainer");
const otherBox = document.getElementById("otherGenderBox");

genderSelect.addEventListener("change", function () {
    if (this.value === "others") {
        otherContainer.classList.add("show");
    } else {
        otherContainer.classList.remove("show");
        otherBox.value = "";
    }
});

// Reset Button hides other input
document.getElementById("resetBtn").addEventListener("click", function () {
    otherContainer.classList.remove("show");
    otherBox.value = "";
});

// Form Validation
document.getElementById("studentForm").addEventListener("submit", function (event) {
    let firstName = document.forms["studentForm"]["firstname"].value.trim();
    let gender = genderSelect.value;

    if (firstName === "") {
        alert("First Name is required.");
        event.preventDefault();
        return;
    }

    if (gender === "others" && otherBox.value.trim() === "") {
        alert("Please specify your gender.");
        event.preventDefault();
        return;
    }
});
