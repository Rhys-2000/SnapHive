//The URIs of the REST endpoint
IUPS = "https://prod-136.westus.logic.azure.com:443/workflows/5c0d01307916425d8dbc287e8582699e/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=atBRe0QwMoE38SrC2gWmDD4D21oIRrsGk07eFf87GPE";
RAI = "https://prod-27.centralus.logic.azure.com:443/workflows/19d52acc041c422282adc93786c0c32c/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=BW2tIIwtl-Hsd0AAdDba5YJtKVFREp_sd3m108vPaRg";
UCN = "https://prod-168.westus.logic.azure.com:443/workflows/7c8834f6c80740b3956e784325ebe11d/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=BKeqOcP-qfqXALgLXCWXP-pxFNedwPmLpvQcspOXbQ4";
QUERY_DOCS = "https://prod-60.westus.logic.azure.com:443/workflows/dd5e158a362f4efdb8a1ff9991976c02/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=DHbwZA63d2SatjuMYIhJ7wQd249_xteL945K4uvE5LQ";

BLOB_ACCOUNT = "https://blobstoragecloud2.blob.core.windows.net";

//Handlers for button clicks
$(document).ready(function() {

 
  $("#retImages").click(function(){

      //Run the get asset list function
      getImages();

  }); 

  $("#hideImages").click(function() {
    $('#ImageList').empty(); // Clears the image list
    $("<h4>No images are currently displayed.</h4>").appendTo("#ImageList"); // Display a message when images are hidden
  });

   //Handler for the new asset submission button
  $("#subNewForm").click(function(){

    //Execute the submit new asset function
    submitNewAsset();
    
  }); 
});

//A function to submit a new asset to the REST endpoint 
function submitNewAsset() {
  submitData = new FormData();

  submitData.append('FileName', $('#FileName').val());
  submitData.append('userID', $('#userID').val());
  submitData.append('userName', $('#userName').val());
  submitData.append('caption', $('#caption').val());
  submitData.append('File', $("#UpFile")[0].files[0]);

  $.ajax({
      url: IUPS,
      data: submitData,
      cache: false,
      enctype: 'multipart/form-data',
      contentType: false,
      processData: false,
      type: 'POST',
      success: function(data) {
          $('#FileName').val('');
          $('#userID').val('');
          $('#userName').val('');
          $('#caption').val('');
          $("#UpFile").val(''); // Clear the file input
          alert("Asset submitted successfully!");
          getImages(); // Refresh image list
      }
  });
}

// Function to get the images (same as before)
function getImages() {
  $('#ImageList').html('<div class="spinner-border" role="status"><span class="sr-only">&nbsp;</span>');
  $.getJSON(RAI, function(data) {
      var items = [];
      $.each(data, function(key, val) {
          items.push("<hr />");
          items.push("<img src='" + BLOB_ACCOUNT + val["filePath"] + "' width='400'/> <br/>");
          items.push(val["caption"] + "<br/>");
          items.push("Uploaded by: " + val["userName"] + "<br/>");
          items.push("<hr />");
          items.push('<button class="btn btn-danger" onclick="deleteImage(\'' + val["id"] + '\')">Delete</button>');
          items.push('<button class="btn btn-primary" onclick="editImage(\'' + val["id"] + '\', \'' + val["caption"] + '\')">Edit</button>');
          items.push("<hr />");
      });
      $('#ImageList').empty();
      $("<ul/>", {
          "class": "my-new-list",
          html: items.join("")
      }).appendTo("#ImageList");
  });
}

// Function to delete image (same as before)
function deleteImage(id) {
  var deleteURI = "https://prod-128.westus.logic.azure.com/workflows/7b86a9e0c6c649b9aed3c3baa307a318/triggers/When_a_HTTP_request_is_received/paths/invoke/rest/v1/assets/" + id + "?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=Pe7zXmdI_bN61h3_Ld4K7LIjNT9bzvUpohc8s3AIIqI";
  if (confirm("Are you sure you want to delete this image?")) {
      $.ajax({
          url: deleteURI,
          type: 'DELETE',
          success: function(response) {
              alert("Image deleted successfully!");
              getImages(); // Refresh image list
          },
          error: function(error) {
              alert("Error deleting image.");
          }
      });
  }
}

// Function to open the edit image modal
function editImage(id, currentCaption) {
  $('#editImageModal').modal('show');
  $('#editCaption').val(currentCaption);
  $('#editImageId').val(id);
}

// Function to submit the edited image caption
function submitEditImage() {
  var imageId = $('#editImageId').val();
  var newCaption = $('#editCaption').val();

  var payload = {
      "id": imageId,
      "caption": newCaption
  };

  $.ajax({
      url: UCN,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      success: function(response) {
          alert("Caption updated successfully!");
          $('#editImageModal').modal('hide');
          getImages(); // Refresh image list
      },
      error: function(error) {
          alert("Error updating caption: " + JSON.stringify(error));
      }
  });
}



function queryDocumentsByUserName() {
  const userName = $('#userNameInput').val(); // Get the entered username
  if (userName) {
    getDocumentsByUserName(userName); // Call the function to get documents
  } else {
    alert("Please enter a username."); // Validation alert
  }
}


function getDocumentsByUserName(userName) {
  $('#ImageList').html('<div class="spinner-border" role="status"><span class="sr-only">&nbsp;</span>'); // Loading spinner

  $.ajax({
    url: QUERY_DOCS, // Endpoint to query documents
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ userName: userName }), // Send the username as JSON payload
    success: function(data) {
      displayImages(data); // Display the retrieved images
    },
    error: function(error) {
      alert("Error fetching documents: " + JSON.stringify(error));
      $('#ImageList').empty(); // Clear spinner on error
    }
  });
}


function displayImages(data) {
  var items = [];
  $.each(data, function(key, val) {
    // Process each document and append to the image list
    items.push("<hr />");
    items.push("<img src='" + BLOB_ACCOUNT + val["filePath"] + "' width='400'/> <br/>");
    items.push(val["caption"] + "<br/>");
    items.push("Uploaded by: " + val["userName"] + "<br/>");
    items.push("<hr />");
    items.push('<button class="btn btn-danger" onclick="deleteImage(\'' + val["id"] + '\')">Delete</button>');
    items.push('<button class="btn btn-primary" onclick="editImage(\'' + val["id"] + '\', \'' + val["caption"] + '\')">Edit</button>');
    items.push("<hr />");
  });
  $('#ImageList').empty();
  $("<ul/>", {
    "class": "my-new-list",
    html: items.join("")
  }).appendTo("#ImageList");
}