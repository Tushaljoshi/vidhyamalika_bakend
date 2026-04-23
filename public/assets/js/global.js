   let table = new DataTable('.dataTable');

      // ✅ Data Table start
      $('.data-table').each(function () {
          const $table = $(this);
          const tableInstance = new DataTable(this);

          // Handle search input (inside same wrapper)
          $table.closest('.dataTable-wrapper').find('.dt-search .dt-input').on('keyup', function () {
              tableInstance.search(this.value).draw();
          });

          // Handle page length change (inside same wrapper)
          $table.closest('.dataTable-wrapper').find('.dt-length .dt-input').on('change', function () {
              const value = $(this).val();
              tableInstance.page.len(value).draw();
          });
      });
      // ✅ Data Table end


// //Data Table start
// $('.data-table').each(function () {
//     const $table = $(this);
//     const tableInstance = new DataTable(this);
//     // Handle search input (inside same wrapper)
//     $table.closest('.dataTable-wrapper').find('.dt-search .dt-input').on('keyup', function () {
//         tableInstance.search(this.value).draw();
//     });
//     // Handle page length change (inside same wrapper)
//     $table.closest('.dataTable-wrapper').find('.dt-length .dt-input').on('change', function () {
//         const value = $(this).val();    
//         tableInstance.page.len(value).draw();
//     });
// });  

//    $(document).ready(function () {
//         $('.data-table').DataTable({
//             pageLength: 10,
//             ordering: true,
//             searching: true
//         });
//     });

// Tooltip (GLOBAL - works after pagination)
new bootstrap.Tooltip(document.body, {
  selector: '[data-bs-toggle="tooltip"]'
});

 

 // TinyMCE
    initTinyMCE();
    function initTinyMCE() {
        tinymce.init({
            selector: '.text_editor',
            height: 400,
            plugins: 'advlist autolink lists link image charmap print preview anchor table',
            toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | removeformat | image link table',
            setup: function(editor) {
                editor.on('change', function() {
                    editor.save();
                });
            }
        });
    }