$(document).on("change", "#subject", function(){
    const subject_id = $(this).val();
    fetch(`/sub-category/get-main-categories/${subject_id}`)
    .then(response => response.json())
    .then(data => {
        if(data.data.length > 0){
            let main_category_html = '<option value="" selected>Select Main Category</option>';
            data.data.forEach(main_category => {
                main_category_html += `
                    <option value="${main_category._id}">
                        ${main_category.name}
                    </option>
                `;
             });
            document.getElementById("main_category").innerHTML = main_category_html;
            document.getElementById("sub_category").innerHTML = '<option value="" selected>Select Sub Category</option>';
            // document.getElementById("edit_main_category").innerHTML = main_category_html;
        }else{
            document.getElementById("main_category").innerHTML =`<option value="">No category found</option>`;  
            // document.getElementById("edit_main_category").innerHTML =`<option value="">No category found</option>`;  
        }
    });

});
$(document).on("change", "#main_category", function(){
    const main_category_id = $(this).val();
    fetch(`/get-sub-categories/${main_category_id}`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if(data.data.length > 0){
            let sub_category_html = '<option value="" selected>Select Sub Category</option>';
            data.data.forEach(sub_category => {
                sub_category_html += `
                    <option value="${sub_category._id}">
                        ${sub_category.name}
                    </option>
                `;
             });
            document.getElementById("sub_category").innerHTML = sub_category_html;
            // document.getElementById("edit_main_category").innerHTML = main_category_html;
        }else{
            document.getElementById("sub_category").innerHTML =`<option value="">No category found</option>`;  
            // document.getElementById("edit_main_category").innerHTML =`<option value="">No category found</option>`;  
        }
    });

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
            window.location.href = `/course/live-course/destroy/${id}`;
        }
    });
});