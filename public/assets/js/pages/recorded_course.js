$(document).on("click", "#add_more_btn", function(){
    let number_of_row = $(".video_section_row").length + 1;
    let html = `
    <div class="row gy-3 video_section_row mb-3">

        <div class="col-xxl-3 col-xl-4 col-sm-6">
            <label class="text-sm fw-semibold text-primary-light mb-2">Lesson No.</label>
            <select class="form-control form-select" name="lesson[]" required>
                <option value="">Select</option>
                ${generateLessons()}
            </select>
        </div>
        <div class="col-xxl-3 col-xl-4 col-sm-6">
        <label class="form-check-label line-height-1 fw-medium  text-secondary-light" for="video_url"> Title </label>
          <input type="text" class="form-control" name="title[]">
        </div>
        <div class="col-xxl-3 col-xl-4 col-sm-6">
            <div class="">
                <label for="video_type" class="text-sm fw-semibold text-primary-light d-inline-block mb-8">Select Video Type</label>
                <div class="d-flex align-items-center flex-wrap gap-28">
                    <div class="form-check checked-primary d-flex align-items-center gap-2">
                        <input class="form-check-input video_type" type="radio" name="video_type_${number_of_row}" value="video_url" checked required>
                        <label class="form-check-label line-height-1 fw-medium  text-secondary-light" for="video_url"> Video URL </label>
                    </div> 
                    <div class="form-check checked-secondary d-flex align-items-center gap-2">
                        <input class="form-check-input video_type" type="radio" name="video_type_${number_of_row}" value="video_file" required>
                        <label class="form-check-label line-height-1 fw-medium text-secondary-light" for="video_file" accept=".mp4"> Video File </label>
                    </div> 
                </div>
            </div>
        </div>

        <div class="col-xxl-3 col-xl-3 col-sm-3">
            <div class="video_field_url">
                <label class="text-sm fw-semibold text-primary-light mb-2">Enter Video URL</label>
                <input type="text" class="form-control" name="video_url[]">
            </div>
            <div class="video_field_file d-none">
                <label class="text-sm fw-semibold text-primary-light mb-2">Upload Video</label>
                <input type="file" class="form-control" name="video_file[]">
            </div>
        </div>

        <div class="col-xxl-2 col-xl-2 col-sm-2"><br>
            <button type="button" class="btn btn-danger btn-sm remove_btn">Remove</button>
        </div>
    </div>`;

    $("#video_section").append(html);

});


$(document).on("click", "#edit_add_more_btn", function(){
    let number_of_row = $(".video_section_row").length + 1;
    let html = `
    <div class="row gy-3 video_section_row mb-3">
        <div class="col-xxl-3 col-xl-4 col-sm-6">
            <label class="text-sm fw-semibold text-primary-light mb-2">Lesson No.</label>
            <select class="form-control form-select" name="lesson[]" required>
                <option value="">Select</option>
                ${generateLessons()}
            </select>
        </div>
        <div class="col-xxl-3 col-xl-4 col-sm-6">
        <label class="form-check-label line-height-1 fw-medium  text-secondary-light" for="video_url"> Title </label>
          <input type="text" class="form-control" name="title[]">
        </div>
        <div class="col-xxl-3 col-xl-3 col-sm-6">
            <div class="">
                <label for="video_type" class="text-sm fw-semibold text-primary-light d-inline-block mb-8">Select Video Type</label>
                <div class="d-flex align-items-center flex-wrap gap-28">
                    <div class="form-check checked-primary d-flex align-items-center gap-2">
                        <input class="form-check-input video_type" type="radio" name="video_type_${number_of_row}" value="video_url" checked required>
                        <label class="form-check-label line-height-1 fw-medium  text-secondary-light" for="video_url"> Video URL </label>
                    </div> 
                    <div class="form-check checked-secondary d-flex align-items-center gap-2">
                        <input class="form-check-input video_type" type="radio" name="video_type_${number_of_row}" value="video_file" required>
                        <label class="form-check-label line-height-1 fw-medium text-secondary-light" for="video_file"> Video File </label>
                    </div> 
                </div>
            </div>
        </div>
        <div class="col-xxl-3 col-xl-3 col-sm-3">
            <div class="video_field_url">
                <label class="text-sm fw-semibold text-primary-light mb-2">Enter Video URL</label>
                <input type="text" class="form-control" name="video_url_${number_of_row}">
            </div>
            <div class="video_field_file d-none">
                <label class="text-sm fw-semibold text-primary-light mb-2">Upload Video</label>
                <input type="file" class="form-control" name="video_file_${number_of_row}" accept=".mp4">
            </div>
        </div>
        <div class="col-xxl-2 col-xl-2 col-sm-2"><br>
            <button type="button" class="btn btn-danger btn-sm remove_btn">Remove</button>
        </div>
    </div>`;
    $("#video_section").append(html);

});

$(document).on("change", ".video_type", function(){
    let row = $(this).closest(".video_section_row");
    if($(this).val() === "video_url"){
        row.find(".video_field_url").removeClass("d-none");
        row.find(".video_field_file").addClass("d-none");
    } else {
        row.find(".video_field_url").addClass("d-none");
        row.find(".video_field_file").removeClass("d-none");
    }
});

$(document).on("click", ".remove_btn", function(){
    $(this).closest(".video_section_row").remove();
});

function generateLessons(){
    let options = "";
    for(let i=1;i<=50;i++){
        options += `<option value="${i}">Lesson ${i}</option>`;
    }
    return options;
}

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
            window.location.href = `/course/recorded-course/destroy/${id}`;
        }
    });
});