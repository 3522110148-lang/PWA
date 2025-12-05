let pedido = [];
const telefono = "2481726753";
const catalogo = document.getElementById("catalogo");
const busqueda = document.getElementById("busqueda");
const consultaBtn = document.getElementById("consultaGeneral");
const btnVerPedido = document.getElementById("btn-ver-pedido");
const contadorPedido = document.getElementById("contador-pedido");
const modal = document.getElementById("modal-pedido");
const btnCerrarModal = document.getElementById("btn-cerrar-modal");
const btnConfirmarPedido = document.getElementById("btn-confirmar-pedido");
const listaPedidoModal = document.getElementById("lista-pedido-modal");
const totalPedidoModal = document.getElementById("total-pedido-modal");

// Lista de dulces
const dulces = [
  { id: "alegria-cacahuate", nombre: "Alegrías con Cacahuate", precio: 15, img: "./img/dulces/alegria con cacahuate1.jfif" },
  { id: "alegria-redondas", nombre: "Alegrías Redondas", precio: 25, img: "./img/dulces/alegria redonda.jfif" },
  { id: "alegria-nuez", nombre: "Alegrías con Nuez", precio: 25, img: "./img/dulces/Alegrias con nuez, pepita, y pasa.jfif" },
  { id: "alegria-sola", nombre: "Alegría", precio: 15, img: "./img/dulces/alegrias normales.jfif" },
  { id: "borrachitos", nombre: "Borrachitos", precio: 35 , img: "./img/dulces/borrachitos.jfif" },
  { id: "calaveras", nombre: "Calaveras de Azúcar", precio: 17, img: "./img/dulces/calaveras de azucar.jfif" },
  { id: "camotes", nombre: "Camotes", precio: 35, img: "./img/dulces/camotes.jfif" },
  { id: "cocadas", nombre: "Cocadas", precio: 15, img: "./img/dulces/cocadas.jfif" },
  { id: "dulce-con-coco", nombre: "Dulce con Coco rosa,amarillo", precio: 15, img: "./img/dulces/dulce con coco.jfif" },
  { id: "dulce-de-coco", nombre: "Dulce de Coco", precio: 45, img: "./img/dulces/dulce de coco.jfif" },
  { id: "garapiñados", nombre: "Garapiñados", precio: 20, img: "./img/dulces/garapiñados.jfif" },
  { id: "jalea", nombre: "Jalea", precio: 25, img: "./img/dulces/jaleas.jfif" },
  { id: "jamoncillo", nombre: "Jamoncillo", precio: 35, img: "./img/dulces/jamoncillo.jfif" },
  { id: "macarrones-leche1", nombre: "Macarrones de Leche", precio: 15, img: "./img/dulces/macarrones de leche.jfif" },
  { id: "macarrones-leche2", nombre: "Macarrones de Leche", precio: 15, img: "./img/dulces/macrrones de leche.jfif" },
  { id: "mueganos", nombre: "Mueganos", precio: 30, img: "./img/dulces/mueganos.jfif" },
  { id: "obleas-cajeta", nombre: "Obleas de Cajeta", precio: 30, img: "./img/dulces/obleas con cajeta.jfif" },
  { id: "obleas-figuras", nombre: "Obleas de Figuras", precio: 30, img: "./img/dulces/obleas de figura.jfif" },
  { id: "obleas-normales", nombre: "Obleas", precio: 16, img: "./img/dulces/obleas normales.jfif" },
  { id: "ollas-tamarindo", nombre: "Ollas de Tamarindo", precio: 16, img: "./img/dulces/ollas de tamarindo.jfif" },
  { id: "palanqueta-chica", nombre: "Palanqueta Chica", precio: 15, img: "./img/dulces/palanqueta chica.jfif" },
  { id: "palanqueta", nombre: "Palanqueta grande", precio: 35, img: "./img/dulces/palanquetas.jfif" },
  { id: "tamarindos-bola", nombre: "Tamarindos de Bola", precio: 16, img: "./img/dulces/tamarindos de bola.jfif" },
  { id: "tarugos-chile-azucar", nombre: "Tarugos de Chile y Azúcar", precio: 16, img: "./img/dulces/tarugos. chile y azucar.jfif"},
  { id: "vasos-tamarindo-sabores", nombre: "Vasos de Tamarindo Sabores", precio: 40, img: "./img/dulces/Vasos de tamarindo sabores.jfif" }
];

// --- IndexedDB --- //
let db;
function startDB() {
  const request = indexedDB.open("dulceriaDB", 1);
  request.onupgradeneeded = function(e){
    db = e.target.result;
    const store = db.createObjectStore("dulces", { keyPath: "id" });
    store.createIndex("by_nombre", "nombre", { unique: false });
    store.createIndex("by_precio", "precio", { unique: false });
    // Insertar todos los dulces del arreglo
    dulces.forEach(d => store.put(d));
  };
  request.onsuccess = function(e){ db = e.target.result; console.log("DB cargada"); };
  request.onerror = function(e){ console.error("Error DB"); };
}

// --- Funciones para renderizar --- //
function renderCatalogo(filtro="") {
  catalogo.innerHTML = "";
  const transaction = db.transaction(["dulces"], "readonly");
  const store = transaction.objectStore("dulces");
  const request = store.getAll();
  request.onsuccess = function(e){
    const datos = request.result.filter(d => d.nombre.toLowerCase().includes(filtro.toLowerCase()));
    datos.forEach(d => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-2xl shadow-lg overflow-hidden p-4";
      card.innerHTML = `
        <img src="${d.img}" alt="${d.nombre}" class="w-full h-48 object-cover rounded-lg mb-2">
        <h2 class="font-bold text-lg">${d.nombre}</h2>
        <p class="text-orange-600 font-semibold">$${d.precio} MXN</p>
        <input type="number" id="cantidad-${d.id}" min="1" value="1" class="w-20 p-1 border rounded mt-1">
        <button data-id="${d.id}" class="btn-agregar mt-2 bg-orange-500 text-white px-3 py-1 rounded">Agregar</button>
      `;
      catalogo.appendChild(card);
    });

    document.querySelectorAll(".btn-agregar").forEach(btn => {
      btn.onclick = e => {
        const id = e.currentTarget.dataset.id;
        const input = document.getElementById(`cantidad-${id}`);
        const cant = parseInt(input.value);
        const dulce = datos.find(d=>d.id===id);
        if(cant>0){
          const enPedido = pedido.find(p=>p.id===id);
          if(enPedido) enPedido.cantidad += cant;
          else pedido.push({...dulce, cantidad:cant});
          actualizarEstadoPedido();
        }
      };
    });
  };
}

// --- Pedido --- //
function actualizarEstadoPedido(){
  if(pedido.length===0) btnVerPedido.classList.add("hidden");
  else{
    btnVerPedido.classList.remove("hidden");
    contadorPedido.textContent = pedido.reduce((a,b)=>a+b.cantidad,0);
  }
}

btnVerPedido.onclick = function(){
  renderModal();
  modal.classList.remove("hidden");
};

btnCerrarModal.onclick = ()=> modal.classList.add("hidden");

btnConfirmarPedido.onclick = ()=>{
  if(pedido.length===0) return alert("Carrito vacío");
  let mensaje = "¡Hola! Quisiera hacer el siguiente pedido:\n\n";
  let total=0;
  pedido.forEach(d=>{
    total += d.precio*d.cantidad;
    mensaje+=`${d.cantidad} x ${d.nombre} - $${d.precio*d.cantidad} MXN\n`;
  });
  mensaje+=`\nTotal: $${total} MXN`;
  window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`,"_blank");
};

// --- Modal dinámico con botones --- //
function renderModal(){
  listaPedidoModal.innerHTML="";
  if(pedido.length===0) return listaPedidoModal.innerHTML="<p>Tu carrito está vacío</p>";
  let total=0;

  pedido.forEach((d,index)=>{
    const item=document.createElement("div");
    item.className="flex justify-between items-center border-b py-2";

    const subtotal = d.precio*d.cantidad;
    total += subtotal;

    item.innerHTML=`
      <span class="flex-1">${d.nombre}</span>
      <div class="flex items-center gap-2">
        <button class="btn-restar bg-red-500 text-white px-2 py-1 rounded">-</button>
        <span class="cantidad">${d.cantidad}</span>
        <button class="btn-aumentar bg-green-500 text-white px-2 py-1 rounded">+</button>
        <button class="btn-eliminar bg-gray-500 text-white px-2 py-1 rounded">Eliminar</button>
      </div>
      <span class="ml-4 font-semibold text-orange-600">$${subtotal}</span>
    `;

    // Botones funcionales
    item.querySelector(".btn-aumentar").onclick = ()=>{
      pedido[index].cantidad++;
      renderModal();
      actualizarEstadoPedido();
    };
    item.querySelector(".btn-restar").onclick = ()=>{
      if(pedido[index].cantidad>1){
        pedido[index].cantidad--;
      } else {
        pedido.splice(index,1);
      }
      renderModal();
      actualizarEstadoPedido();
    };
    item.querySelector(".btn-eliminar").onclick = ()=>{
      pedido.splice(index,1);
      renderModal();
      actualizarEstadoPedido();
    };

    listaPedidoModal.appendChild(item);
  });

  totalPedidoModal.textContent=`$${total} MXN`;
}


btnVerPedido.onclick = function(){
  renderModal();
  modal.classList.remove("hidden");
};

btnCerrarModal.onclick = ()=> modal.classList.add("hidden");

btnConfirmarPedido.onclick = ()=>{
  if(pedido.length===0) return alert("Carrito vacío");
  let mensaje = "¡Hola! Quisiera hacer el siguiente pedido:\n\n";
  let total=0;
  pedido.forEach(d=>{
    total += d.precio*d.cantidad;
    mensaje+=`${d.cantidad} x ${d.nombre} - $${d.precio*d.cantidad} MXN\n`;
  });
  mensaje+=`\nTotal: $${total} MXN`;
  window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`,"_blank");
};

function renderModal() {
    listaPedidoModal.innerHTML = '';
    if (pedido.length === 0) {
        listaPedidoModal.innerHTML = `<p class="text-center text-gray-500">Tu carrito está vacío.</p>`;
        totalPedidoModal.textContent = '$0 MXN';
        return;
    }

    let total = 0;

    pedido.forEach((dulce, index) => {
        const subtotal = dulce.precio * dulce.cantidad;
        total += subtotal;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex items-center justify-between border-b py-2';

        // Nombre + subtotal
        const infoDiv = document.createElement('div');
        infoDiv.className = 'flex-1';
        infoDiv.innerHTML = `<span class="font-semibold">${dulce.nombre}</span>`;

        // Cantidad y botones
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'flex items-center gap-2';
        
        const btnRestar = document.createElement('button');
        btnRestar.textContent = '-';
        btnRestar.className = 'btn-restar bg-red-500 text-white px-2 py-1 rounded';
        btnRestar.onclick = () => {
            if(dulce.cantidad > 1){
                dulce.cantidad--;
            } else {
                pedido.splice(index, 1);
            }
            renderModal();
            actualizarEstadoPedido();
        };

        const cantidadSpan = document.createElement('span');
        cantidadSpan.textContent = dulce.cantidad;
        cantidadSpan.className = 'cantidad px-2';

        const btnSumar = document.createElement('button');
        btnSumar.textContent = '+';
        btnSumar.className = 'btn-sumar bg-green-500 text-white px-2 py-1 rounded';
        btnSumar.onclick = () => {
            dulce.cantidad++;
            renderModal();
            actualizarEstadoPedido();
        };

        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.className = 'btn-eliminar bg-gray-500 text-white px-2 py-1 rounded';
        btnEliminar.onclick = () => {
            pedido.splice(index, 1);
            renderModal();
            actualizarEstadoPedido();
        };

        controlsDiv.append(btnRestar, cantidadSpan, btnSumar, btnEliminar);

        // Subtotal
        const subtotalSpan = document.createElement('span');
        subtotalSpan.className = 'ml-4 font-semibold text-orange-600';
        subtotalSpan.textContent = `$${subtotal}`;

        // Armamos el item
        itemDiv.append(infoDiv, controlsDiv, subtotalSpan);
        listaPedidoModal.appendChild(itemDiv);
    });

    totalPedidoModal.textContent = `$${total} MXN`;
}


// --- Busqueda y consulta --- //
busqueda.oninput = e=>renderCatalogo(e.target.value);
consultaBtn.onclick = ()=> window.open(`https://wa.me/${telefono}?text=${encodeURIComponent("Hola! Más información por favor")}`,"_blank");

// --- Inicializar DB y renderizar --- //
startDB();
setTimeout(()=>renderCatalogo(), 500);
