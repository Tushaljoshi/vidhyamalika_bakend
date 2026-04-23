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
    const status = $(this).data('status');
    console.log(subject_id);  
    $("#category_id").val(id);
    $("#edit_category_name").val(name);
    $("#edit_category_status").val(status);
    $("#edit_subject").val(subject_id);
    $('.edit_sidebar_form').addClass('active');
    $('.overlay').addClass('active');
});

// Delete subject
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
            window.location.href = `/main-category/destroy/${id}`;
        }
    });
});