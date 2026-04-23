let currentBlock = null;

// OPEN EDIT MODAL
document.addEventListener("click", function(e) {
    if (e.target.closest(".edit-btn")) {

        const block = e.target.closest(".question-block");
        currentBlock = block;

        // Get values
        const question = block.querySelector(".question-text").innerText;
        const test_id = block.querySelector(".test_id").value;
        const options = block.querySelectorAll(".option-text");
        const correct = block.querySelector(".correct-answer").innerText;
        const marks = block.querySelector(".marks").innerText;

        // Fill modal
        document.getElementById("edit_question").value = question;
        document.getElementById("edit_option_a").value = options[0].innerText;
        document.getElementById("edit_option_b").value = options[1].innerText;
        document.getElementById("edit_option_c").value = options[2].innerText;
        document.getElementById("edit_option_d").value = options[3].innerText;
        document.getElementById("edit_answer").value = correct;
        document.getElementById("edit_marks").value = marks;
        document.getElementById("edit_test_id").value = test_id;

        // Open modal
        new bootstrap.Modal(document.getElementById('editModal')).show();
    }
});


// UPDATE QUESTION
function updateQuestion() {
    if (!currentBlock) return;

    // Get updated values
    const question = document.getElementById("edit_question").value;
    const options = [
        document.getElementById("edit_option_a").value,
        document.getElementById("edit_option_b").value,
        document.getElementById("edit_option_c").value,
        document.getElementById("edit_option_d").value
    ];
    const correct = document.getElementById("edit_answer").value;
    const marks = document.getElementById("edit_marks").value;

    // Update UI
    currentBlock.querySelector(".question-text").innerText = question;

    currentBlock.querySelectorAll(".option-text").forEach((el, i) => {
        el.innerText = options[i];
    });

    currentBlock.querySelector(".correct-answer").value = correct;
    currentBlock.querySelector(".marks").value = marks;

    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
}