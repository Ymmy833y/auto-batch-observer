document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#observation-add').addEventListener('click', () => {
    const observationsElem = document.querySelector('#observation');
    const index = observationsElem.getElementsByTagName('form').length;
    const newElem = document.createElement('div');
    newElem.classList.add('accordion-item');
    newElem.innerHTML = `
      <h2 class="accordion-header" id="header-${index}">
        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#content-${index}" aria-expanded="true" aria-controls="content-${index}">
          Add Observation
        </button>
      </h2>
      <div id="content-${index}" class="accordion-collapse collapse show" aria-labelledby="header-${index}">
        <div class="accordion-body">
          <form method="post" action="/update">
            <input type="hidden" name="index" value="${index}">
            <div class="row mb-2">
              <div class="col-2">
                <label for="name-${index}" class="col-form-label">Name</label>
              </div>
              <div class="col-10">
                <input type="text" name="name" id="name-${index}" class="form-control">
              </div>
            </div>
            <div class="row mb-2">
              <div class="col-2">
                <label for="filepath-${index}" class="col-form-label">FilePath</label>
              </div>
              <div class="col-10">
                <input type="text" name="filePath" id="filepath-${index}" class="form-control">
              </div>
            </div>
            <div class="mb-2">
              <div class="d-flex justify-content-between mb-2">
                <p>Triggers</p>
                <button class="btn btn-outline-info btn-sm px-3" id="triggers-add-${index}" type="button" onclick="addTrigger(this)">Add</button>
              </div>
              <ul class="mb-2 list-group" id="triggers-${index}"></ul>
            </div>
            <div class="mb-2 d-flex justify-content-end">
              <button type="submit" class="btn btn-primary w-25">Update</button>
            </div>
          </form>
        </div>
      </div>
    `;
    observationsElem.appendChild(newElem);
  });

  const addTrigger = (e) => {
    const id = e.id.replace('triggers-add-', '');
    const ulElem = document.querySelector('#triggers-' + id);
    const liIndex = ulElem.getElementsByTagName('li').length;
    const newLiElem = document.createElement('li');
    newLiElem.classList.add('list-group-item');
    newLiElem.innerHTML = `
      <div class="row">
        <div class="col-2">
          <label for="pattern-${id}-${liIndex}" class="col-form-label">Pattern</label>
        </div>
        <div class="col-10">
          <input type="text" name="pattern" id="pattern-${id}-${liIndex}" class="form-control">
        </div>
        <div class="col-2">
          <label for="script-${id}-${liIndex}" class="col-form-label">Script</label>
        </div>
        <div class="col-10">
          <textarea name="script" id="script-${id}-${liIndex}" class="form-control"></textarea>
        </div>
      </div>`;
    ulElem.appendChild(newLiElem);
  };
});
