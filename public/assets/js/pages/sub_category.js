// Sidebar js start
$('.add_new_btn').on('click', function () {
      $('.create_form_sidebar').addClass('active');
      $('.overlay').addClass('active');
});
$('.close_sidebar_form, .overlay').on('click', function () {
      $('.create_form_sidebar').removeClass('active');
      $('.edit_sidebar_form').removeClass('active');
      $('.overlay').removeClass('active');
});

$(".edit_btn").on("click", function(){
    const id = $(this).data('id');
    const name = $(this).data('name');
    const subject_id = $(this).data('subject-id');
    const main_category_id = $(this).data('main-category-id');
    const status = $(this).data('status');
    
    fetch(`/sub-category/get-main-categories/${subject_id}`)
    .then(response => response.json())
    .then(data => {
        if(data.data.length > 0){
            let main_category_html = '';
            data.data.forEach(main_category => {
                main_category_html += `
                    <option value="${main_category._id}">
                        ${main_category.name}
                    </option>
                `;
             });
            document.getElementById("edit_main_category").innerHTML = main_category_html;
        }else{
            document.getElementById("edit_main_category").innerHTML =
            `<option value="">No category found</option>`;  
        }
    });

    $("#category_id").val(id);
    $("#edit_name").val(name);
    $("#edit_subject").val(subject_id);
    $("#edit_main_category").val(main_category_id);
    $("#edit_status").val(status);
    $('.edit_sidebar_form').addClass('active');
    $('.overlay').addClass('active');
});

// Get main category using subject
$("#subject, #edit_subject").on("change", function () {
    const subject_id = $(this).val();
    fetch(`/sub-category/get-main-categories/${subject_id}`)
    .then(response => response.json())
    .then(data => {
        if(data.data.length > 0){
            let main_category_html = '';
            data.data.forEach(main_category => {
                main_category_html += `
                    <option value="${main_category._id}">
                        ${main_category.name}
                    </option>
                `;
             });
            document.getElementById("main_category").innerHTML = main_category_html;
            document.getElementById("edit_main_category").innerHTML = main_category_html;
        }else{
            document.getElementById("main_category").innerHTML =`<option value="">No category found</option>`;  
            document.getElementById("edit_main_category").innerHTML =`<option value="">No category found</option>`;  
        }
    });
});


// Delete Sub Category
$(".delete_btn").on("click", function(){
    const id = $(this).data('id');
    Swal.fire({
        title: "Are you sure?",
        text: "This record will be permanently deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = `/sub-category/destroy/${id}`;
        }
    });
});