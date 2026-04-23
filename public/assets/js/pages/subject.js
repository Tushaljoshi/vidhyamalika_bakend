
// Sidebar js start
$('.my-sidebar-btn').on('click', function () {
      $('.my-sidebar').addClass('active');
      $('.overlay').addClass('active');
});
$('.close-my-sidebar, .overlay').on('click', function () {
      $('.my-sidebar').removeClass('active');
      $('.edit-sidebar').removeClass('active');
      $('.overlay').removeClass('active');
});
$(".edit_btn").on("click", function(){
    const id = $(this).data('id');
    const name = $(this).data('name');
    const status = $(this).data('status');
    // status = status ? "active":"inactive";
    $("#subject_id").val(id);
    $("#edit_subject_name").val(name);
    $("#edit_status").val(status);
    $('.edit-sidebar').addClass('active');
    $('.overlay').addClass('active');
});
// Sidebar js end
// ---------------------------------------------------------------------------------------------
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
            window.location.href = `/subject/destroy/${id}`;
        }
    });
});