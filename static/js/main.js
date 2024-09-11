const eventSource = new EventSource('/events');

eventSource.addEventListener('batchTrigger', (event) => {
  const batchJob = JSON.parse(event.data);

  showToast(batchJob);
  addBatchResult(batchJob);
});

const showToast = (batchJob) => {
  const newElem = document.createElement('div');
  newElem.classList.add('toast');
  newElem.setAttribute('role', 'alert');
  newElem.setAttribute('aria-live', 'assertive');
  newElem.setAttribute('aria-atomic', 'true');
  newElem.setAttribute('data-bs-autohide', 'false');

  newElem.innerHTML = `
    <div class='toast-header'>
      <strong class='me-auto'>Triggered the script</strong>
      <small class='text-muted'>${batchJob.activationTime}</small>
      <button type='button' class='btn-close' data-bs-dismiss='toast' aria-label='Close'></button>
    </div>
    <div class='toast-body'>
      <h5 class='me-2 mb-1'>${batchJob.name}</h5>
      <span class='me-1'>></span><span class='me-2'>${batchJob.script}</span>
    </div>`;

  document.querySelector('#toastContainer').appendChild(newElem);

  // eslint-disable-next-line no-undef
  const toast = new bootstrap.Toast(newElem);
  toast.show();

  setTimeout(() => toast.hide(), 30 * 1000);
}

const addBatchResult = (batchJob) => {
  const batchResultsListElem = document.querySelector('#batchResults-list');
  
  const newElem = document.createElement('div');
  newElem.classList.add('list-group-item', 'batch-results-item');
  newElem.id = `batchResults-${batchJob.id}`;
  newElem.innerHTML = `
    <a class='d-flex justify-content-between btn px-0' data-bs-toggle='collapse' href='#batchResults-${batchJob.id}-collapse'>
      <div class='d-flex align-items-center'>
        <div class="spinner-border spinner-border-sm me-2">
          <span class="visually-hidden">Loading...</span>
        </div>
        <div class='mb-1 text-start'>
          <h5 class='me-2 mb-1'>${batchJob.name}</h5>
          <span class='me-1'>></span><span class='me-2'>${batchJob.script}</span>
        </div>
      </div>
      <small>${batchJob.activationTime}</small>
    </a>`;
  batchResultsListElem.appendChild(newElem);

  const noneElem = document.querySelector('#batchResults-none');
  if (noneElem) {
    noneElem.remove();
  }
}

eventSource.addEventListener('batchResults', (event) => {
  const batchJob = JSON.parse(event.data);
  const escapedBody = batchJob.results.body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\t/g, '&nbsp;')
    .replace(/\r\n/g, '<br>')
    .replace(/\n/g, '<br>');

  const batchResultsElem = document.querySelector(`#batchResults-${batchJob.id}`)
  batchResultsElem.innerHTML = `
    <a class='d-flex justify-content-between btn px-0' data-bs-toggle='collapse' href='#batchResults-${batchJob.id}-collapse'>
      <div class='d-flex align-items-center'>
        <svg width='20' height='20' class='text-${batchJob.results.isSuccess ? 'success' : 'danger'} me-2' fill='currentColor'>
          <use xlink:href='#${batchJob.results.isSuccess ? 'check' : 'x'}-circle'></use>
        </svg>
        <div class='mb-1 text-start'>
          <h5 class='me-2 mb-1'>${batchJob.name}</h5>
          <span class='me-1'>></span><span class='me-2'>${batchJob.script}</span>
        </div>
      </div>
      <small>${batchJob.activationTime} ~ ${batchJob.results.completionTime}</small>
    </a>
    <div class='collapse' id='batchResults-${batchJob.id}-collapse'>
      <pre class='card card-body batch-results-body'>${escapedBody}</pre>
    </div>`;
});

document.querySelector('#observation-add').addEventListener('click', () => {
  const observationsElem = document.querySelector('#observation');
  const index = observationsElem.getElementsByTagName('form').length;
  const newElem = document.createElement('div');
  newElem.classList.add('accordion-item');
  newElem.innerHTML = `
    <h2 class='accordion-header' id='header-${index}'>
      <button class='accordion-button' type='button' data-bs-toggle='collapse' data-bs-target='#content-${index}' aria-expanded='true' aria-controls='content-${index}'>
        New Observation
      </button>
    </h2>
    <div id='content-${index}' class='accordion-collapse collapse show' aria-labelledby='header-${index}'>
      <div class='accordion-body'>
        <form method='post' action='/update'>
          <input type='hidden' name='index' value='${index}'>
          <div class='row mb-2'>
            <div class='col-2'>
              <label for='name-${index}' class='col-form-label'>Name</label>
            </div>
            <div class='col-10'>
              <input type='text' name='name' id='name-${index}' class='form-control'>
            </div>
          </div>
          <div class='row mb-2'>
            <div class='col-2'>
              <label for='filepath-${index}' class='col-form-label'>FilePath</label>
            </div>
            <div class='col-10'>
              <input type='text' name='filePath' id='filepath-${index}' class='form-control'>
            </div>
          </div>
          <div class='mb-2'>
            <div class='d-flex justify-content-between mb-2'>
              <p>Triggers</p>
              <button class='btn btn-outline-secondary' id='triggers-add-${index}' type='button' onclick='addTrigger(this)'>Add New Trigger</button>
            </div>
            <ul class='mb-2 list-group' id='triggers-${index}'></ul>
          </div>
          <div class='d-flex justify-content-end form-check my-3'>
            <input class='remove-check form-check-input me-2' type='checkbox' name='remove' id='remove-${index}' onchange='toggleRemoveCheck(this)'>
            <label class='form-check-label' for='remove-${index}'>Remove an Observation</label>
          </div>
          <div class='mb-2 d-flex justify-content-end'>
            <button type='submit' class='btn btn-primary w-25'>Update</button>
          </div>
        </form>
      </div>
    </div>`;
  observationsElem.appendChild(newElem);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const addTrigger = (e) => {
  const id = e.id.replace('triggers-add-', '');
  const ulElem = document.querySelector('#triggers-' + id);
  const liIndex = ulElem.getElementsByTagName('li').length;
  const newLiElem = document.createElement('li');
  newLiElem.classList.add('list-group-item');
  newLiElem.innerHTML = `
    <div class='row'>
      <div class='col-2'>
        <label for='pattern-${id}-${liIndex}' class='col-form-label'>Pattern</label>
      </div>
      <div class='col-10'>
        <input type='text' name='pattern' id='pattern-${id}-${liIndex}' class='form-control'>
      </div>
      <div class='col-2'>
        <label for='script-${id}-${liIndex}' class='col-form-label'>Script</label>
      </div>
      <div class='col-10'>
        <textarea name='script' id='script-${id}-${liIndex}' class='form-control'></textarea>
      </div>
    </div>`;
  ulElem.appendChild(newLiElem);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const toggleRemoveCheck = (e => {
  const { checked } = e;

  const formElem = e.closest('form');
  formElem.querySelectorAll('input, textarea, button').forEach((element) => {
    if (element.tagName.toLowerCase() === 'button' && element.type === 'submit') {
      element.innerText = (checked) ? 'Remove' : 'Update';
      return;
    } else if (element.tagName.toLowerCase() === 'input' && element.type === 'hidden') {
      return;
    }
    element.disabled = checked;
  });
  e.disabled = false;
});
