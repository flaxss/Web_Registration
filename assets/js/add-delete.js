const originalDiv = document.getElementById("familyMember");
let counter = 0;
let divCount = 1;
function addFamMem() {
    const container = document.getElementById('additionalFamilyMember');
    const newDiv = document.createElement('div');
    const container2 = document.getElementById('addNum');
    const newDiv2 = document.createElement('div');
    newDiv2.textContent = null;

    divCount++;
    newDiv2.textContent = divCount+'.';
    container2.appendChild(newDiv2);
    
    const originalContent = originalDiv.innerHTML;
    newDiv.id = `newDiv${counter}`;
    newDiv.innerHTML = originalContent;
    container.appendChild(newDiv);
    
    document.getElementById('del').style.display = 'block';
    newDiv2.textContent = null;
}
function delFamMem() {
    const container = document.getElementById('additionalFamilyMember');
    const children = container.children;
    
    container.removeChild(children[children.length - 1]);
    if (children.length === 0) {
        document.getElementById('del').style.display = "none";
        document.getElementById('add').style.display = 'block';
        divCount = 1;
        return;
    }
    divCount --;
}