let products = [
{ id:1, name:"Night Ripper II", price:6500, description:"High-power LED", stock:10, image:"./items/NightRipper2.jpg" },
{ id:2, name:"Mini Version III", price:3000, description:"Compact", stock:15, image:"./items/MiniVersion3.jpg" },
{ id:3, name:"Night Ripper Plus", price:5500, description:"Enhanced", stock:8, image:"./items/NightRipperPlus.jpg" },
{ id:4, name:"Mini Plus", price:4000, description:"Portable", stock:12, image:"./items/MiniPlus.jpg" },
{ id:5, name:"Quad Beam", price:7500, description:"Multi-beam", stock:5, image:"./items/QuadBeam.jpg" },
{ id:6, name:"Mini Pod", price:3000, description:"Efficient", stock:20, image:"./items/MiniPod.jpg" }
];

let cart = {};

const productsGrid = document.getElementById("productsGrid");
const cartItems = document.getElementById("cartItems");
const total = document.getElementById("total");
const cartBadge = document.getElementById("cartBadge");
const searchInput = document.getElementById("searchInput");
const viewModal = document.getElementById("viewModal");
const viewContent = document.getElementById("viewContent");
const receiptModal = document.getElementById("receiptModal");
const receiptContent = document.getElementById("receiptContent");

function goHome(){
    window.location.href="index.html";
}

function showSection(section,btn){
    document.querySelectorAll("section").forEach(s=>s.style.display="none");
    document.getElementById(section+"Section").style.display="block";
    document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
    if(btn) btn.classList.add("active");
}

function displayProducts(list=products){
    productsGrid.innerHTML=list.map(p=>`
    <div class="product-card" onclick="openViewModal(${p.id})">
        <img src="${p.image}">
        <h3>${p.name}</h3>
        <p>₱${p.price}</p>
        <p class="${p.stock<=5?'low-stock':''}">Stock: ${p.stock}</p>
        <button onclick="event.stopPropagation(); addToCart(${p.id})">
            Add to Cart
        </button>
    </div>`).join("");
}
displayProducts();

searchInput.addEventListener("input",()=>{
    const q=searchInput.value.toLowerCase();
    displayProducts(products.filter(p=>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    ));
});

function openViewModal(id){
    const p=products.find(x=>x.id===id);

    viewContent.innerHTML=`
    <img src="${p.image}">
    <div>
        <h2>${p.name}</h2>
        <p><strong>Price:</strong> ₱${p.price}</p>
        <p>${p.description}</p>
        <p>Stock: ${p.stock}</p>

        <label>Quantity:</label>
        <input type="number" id="qtyInput" min="1" max="${p.stock}" value="1">

        <button onclick="addWithQty(${p.id})">
            Add to Cart
        </button>
    </div>`;

    viewModal.style.display="flex";
}

function closeViewModal(){
    viewModal.style.display="none";
}

function addWithQty(id){
    const p=products.find(x=>x.id===id);
    const qty=parseInt(document.getElementById("qtyInput").value);

    if(isNaN(qty) || qty<=0){
        alert("Invalid quantity.");
        return;
    }

    if(qty>p.stock){
        alert("Not enough stock available.");
        return;
    }

    if(cart[id]) cart[id].qty+=qty;
    else cart[id]={...p,qty:qty};

    p.stock-=qty;

    updateCart();
    displayProducts();
    closeViewModal();
}

function updateCart(){
    const items=Object.values(cart);

    cartItems.innerHTML=items.length?items.map(i=>`
    <div class="cart-item">
        ${i.name}
        <input type="number" min="1" value="${i.qty}"
        onchange="updateQuantity(${i.id},this.value)">
        = ₱${i.price*i.qty}
        <button onclick="removeItem(${i.id})">Remove</button>
    </div>`).join(""):"Cart empty";

    total.textContent=items.reduce((s,i)=>s+i.price*i.qty,0);
    cartBadge.textContent=items.reduce((s,i)=>s+i.qty,0);
}

function updateQuantity(id,newQty){
    const p=products.find(x=>x.id===id);
    newQty=parseInt(newQty);

    if(isNaN(newQty) || newQty<=0){
        alert("Invalid quantity.");
        updateCart();
        return;
    }

    const difference=newQty-cart[id].qty;

    if(difference>p.stock){
        alert("Not enough stock.");
        updateCart();
        return;
    }

    p.stock-=difference;
    cart[id].qty=newQty;

    updateCart();
    displayProducts();
}

function removeItem(id){
    const p=products.find(x=>x.id===id);
    p.stock+=cart[id].qty;
    delete cart[id];
    updateCart();
    displayProducts();
}

function confirmOrder(){
    if(!Object.values(cart).length){
        alert("Cart empty!");
        return;
    }

    const confirmed=confirm("Are you sure you want to place this order?");
    if(confirmed) generateReceipt();
}

function generateReceipt(){
    const orderNumber="ORD-"+Math.floor(Math.random()*100000);
    const now=new Date().toLocaleString();
    const items=Object.values(cart);

    let receiptHTML=`
    <p><strong>Order No:</strong> ${orderNumber}</p>
    <p><strong>Date:</strong> ${now}</p>
    <hr>`;

    items.forEach(i=>{
        receiptHTML+=`
        <p>${i.name} x ${i.qty} = ₱${i.price*i.qty}</p>`;
    });

    receiptHTML+=`
    <hr>
    <h3>Total: ₱${items.reduce((s,i)=>s+i.price*i.qty,0)}</h3>`;

    receiptContent.innerHTML=receiptHTML;
    receiptModal.style.display="flex";

    cart={};
    updateCart();
}

function closeReceipt(){
    receiptModal.style.display="none";
}