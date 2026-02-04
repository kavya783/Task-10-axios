// Get container elements for table and card views
const cardContainer = document.getElementById("cardContainer");
const tableBody = document.getElementById("tableBody");

// Variables used for edit/delete operations
let editStudentId = null;
let deleteStudentId = null;

// Stores base64 image string
let img = "";

// Function to fetch students using axios
function axiosStudents() {
    axios.get("http://localhost:3000/studentdetails")
        .then(res => {
            const data = res.data;

            // Clear existing table and cards
            tableBody.innerHTML = "";
            cardContainer.innerHTML = "";

            // Loop through each student
            data.forEach((stu) => {

                // Add student row in table
                tableBody.innerHTML += `
          <tr>
            <td>
     <img src="data:image/png;base64,${stu.image}" class="img-thumbnail"
               style="width:100px;height:100px;object-fit:cover">
  </td>

            <td class="bg-info">${stu.name}</td>
            <td class="bg-info">${stu.branch}</td>
            <td class="bg-info">${stu.phone}</td>
            <td>
              <div class="d-flex justify-content-around ">
                <button class="btn btn-primary btn-sm" data-id="${stu.id}" data-action="view">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-secondary btn-sm" data-id="${stu.id}" data-action="edit">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-danger btn-sm" data-id="${stu.id}" data-action="delete">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>
            </td>
          </tr>
        `;

                // Add student card layout
                cardContainer.innerHTML += `
          <div class="card mb-3 shadow-sm">
                <div class="card-body">
            <div class="card-body bg-info  text-center">
          <img src="data:image/png;base64,${stu.image}" class="img-fluid rounded"
               style="max-height:120px;object-fit:cover">
              <div class="row mb-1">
              <div class="col-6 fw-bold text-start ps-4">Name:</div>
              <div class="col-6 text-start ps-0 ms-0">${stu.name}</div>
              </div>
              <div class="row mb-1">
              <div class="col-6 fw-bold text-start ps-4">Branch:</div>
              <div class="col-6 text-start ps-0 ms-0">${stu.branch}</div>
              </div>
              <div class="row mb-1">
              <div class="col-6 text-start fw-bold ps-4">Phone:</div>
              <div class="col-6 text-start ps-0 ms-0">${stu.phone}</div>
              </div>
             
              <div class="d-flex justify-content-between">
                <button class="btn btn-primary btn-sm" data-id="${stu.id}" data-action="view">
                <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-secondary btn-sm" data-id="${stu.id}" data-action="edit">
                <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-danger btn-sm" data-id="${stu.id}" data-action="delete">
                <i class="bi bi-trash-fill"></i>
                </button>
              </div>
            </div>
          </div>
          </div>
        `;
            });
        })
        .catch(err => console.error(err));
}

// Load students on page load
axiosStudents();


// Handle image selection
document.getElementById("image").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    // Restrict image size to 2MB
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
        alert("Image is too large! Max 2MB");
        return;
    }

    // Convert image to base64
    const reader = new FileReader();
    reader.onload = function (e) {
        img = e.target.result.split(',')[1];
        console.log("Base64 part only:", img);
        // Preview image
        const preview = document.getElementById("previewImage");
        preview.src = "data:image/png;base64," + img;
        preview.style.display = "block";
    };
    reader.readAsDataURL(file);
});


// Add or update student
document.getElementById("addStudentBtn").addEventListener("click", () => {
    const Name = document.getElementById("name").value;
    const Branch = document.getElementById("branch").value;
    const Phone = document.getElementById("phone").value;

    // Error fields
    const nameError = document.getElementById("nameerror");
    const branchError = document.getElementById("brancherror");
    const phoneError = document.getElementById("phoneerror");
    const imageError = document.getElementById("imageerror");

    // Clear errors
    nameError.innerHTML = "";
    branchError.innerHTML = "";
    phoneError.innerHTML = "";
    imageError.innerHTML = "";

    // Validation checks
    if (!/^[A-Z][a-z]{2,}$/.test(Name)) {
        nameError.innerHTML = "First name must start with capital & min 3 letters";
        return;
    }

    if (!/^[A-Z][a-z]{2,}$/.test(Branch)) {
        branchError.innerHTML = "first letter must start with capital & min 3 letters";
        return;
    }

    if (!/^[0-9]{10}$/.test(Phone)) {
        phoneError.innerHTML = "Enter valid 10 digit phone number";
        return;
    }

    if (img.length == 0) {
        imageError.innerHTML = "please select image";
        return;
    }

    // Decide method: add or update
    let method, url;
    if (editStudentId) {
        method = "put";
        url = `http://localhost:3000/studentdetails/${editStudentId}`;
    } else {
        method = "post";
        url = "http://localhost:3000/studentdetails";
    }

    // Send request
    axios({
        method: method,
        url: url,
        data: { name: Name, branch: Branch, phone: Phone, image: img }
    })
        .then(() => {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById("studentModal"));
            modal.hide();

            // Reload students
            axiosStudents();

            // Reset form
            document.getElementById("name").value = "";
            document.getElementById("branch").value = "";
            document.getElementById("phone").value = "";
            document.getElementById("addStudentBtn").textContent = "Add Student";
            editStudentId = null;
        })
        .catch(err => console.error(err));
});


// Button click handler for view/edit/delete
document.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = btn.dataset.id;
    const action = btn.dataset.action;

    // VIEW student
    if (action === "view") {
        axios.get(`http://localhost:3000/studentdetails/${id}`)
            .then(res => {
                const stu = res.data;

                document.getElementById("viewModalBody").innerHTML = `
          <div class="card shadow-sm text-center mx-auto" style="max-width: 360px; width: 100%;">
            <div class="card-body p-4">
         <img src="data:image/png;base64,${stu.image}" 
     class="img-fluid rounded mb-2"
     style="max-height:200px">
              <h5>Name: ${stu.name}</h5>
              <h5>Branch: ${stu.branch}</h5>
              <p>Phone No: ${stu.phone}</p>
            </div>
          </div>
        `;

                new bootstrap.Modal(document.getElementById("viewStudentModal")).show();
            });
    }

    // EDIT student
    if (action === "edit") {
        editStudentId = id;
        axios.get(`http://localhost:3000/studentdetails/${id}`)
            .then(res => {
                const stu = res.data;

                document.getElementById("name").value = stu.name;
                document.getElementById("branch").value = stu.branch;
                document.getElementById("phone").value = stu.phone;

                img = stu.image;

                const preview = document.getElementById("previewImage");
                preview.src = "data:image/png;base64," + img;
                preview.style.display = "block";

                document.getElementById("addStudentBtn").textContent = "Update Student";

                new bootstrap.Modal(document.getElementById("studentModal")).show();
            });
    }

    // DELETE student
    if (action === "delete") {
        deleteStudentId = id;
        new bootstrap.Modal(document.getElementById("deleteModal")).show();
    }
});


// Confirm delete action
document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
    axios.delete(`http://localhost:3000/studentdetails/${deleteStudentId}`)
        .then(() => {
            axiosStudents();
            deleteStudentId = null;

            // Hide modal
            bootstrap.Modal.getInstance(document.getElementById("deleteModal")).hide();
        });
});


// Reset modal when closed
const studentModal = document.getElementById("studentModal");
studentModal.addEventListener("hidden.bs.modal", () => {
    editStudentId = null;

    document.getElementById("name").value = "";
    document.getElementById("branch").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("image").value = "";

    document.getElementById("previewImage").style.display = "none";
    img = "";

    document.getElementById("nameerror").innerHTML = "";
    document.getElementById("brancherror").innerHTML = "";
    document.getElementById("phoneerror").innerHTML = "";
    document.getElementById("imageerror").innerHTML = "";

    document.getElementById("addStudentBtn").textContent = "Add Student";
});
