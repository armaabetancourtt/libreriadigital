const form = document.getElementById('libroForm');
const listaLibros = document.getElementById('listaLibros');
const totalLibrosEl = document.getElementById('totalLibros');
const searchInput = document.getElementById('searchInput');
const loader = document.getElementById('loader');
const emptyState = document.getElementById('emptyState');

let librosCache = [];

async function obtenerLibros() {
    showLoader(true);
    try {
        const res = await fetch('/api/libros');
        librosCache = await res.json();
        filtrarYRenderizar();
    } catch (e) {
        notify("Fallo en la conexión", "error");
    } finally {
        showLoader(false);
    }
}

function filtrarYRenderizar() {
    const busqueda = searchInput.value.toLowerCase();
    const librosFiltrados = librosCache.filter(l => 
        l.titulo.toLowerCase().includes(busqueda) || 
        l.autor.toLowerCase().includes(busqueda)
    );
    renderTable(librosFiltrados);
    totalLibrosEl.textContent = librosCache.length;
}

function renderTable(libros) {
    listaLibros.innerHTML = '';
    if (libros.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');
    libros.forEach((libro, i) => {
        const tr = document.createElement('tr');
        tr.style.animation = `slideIn 0.4s ease forwards ${i * 0.05}s`;
        tr.innerHTML = `
            <td><span class="badge-id">${libro.id}</span></td>
            <td>
                <div style="display:flex; flex-direction:column">
                    <strong style="font-size:1rem">${libro.titulo}</strong>
                    <span style="color:var(--t-dim); font-size:0.85rem">${libro.autor}</span>
                </div>
            </td>
            <td class="text-center"><span class="status-pill">Disponible</span></td>
            <td class="text-right">
                <button class="btn-edit" onclick="editarLibro(${libro.id})">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="btn-del" onclick="eliminarLibro(${libro.id})">
                    <i class="fas fa-trash-can"></i>
                </button>
            </td>
        `;
        listaLibros.appendChild(tr);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('titulo').value;
    const autor = document.getElementById('autor').value;
    const btn = document.getElementById('btnSubmit');
    btn.style.opacity = '0.5';
    btn.disabled = true;
    try {
        const res = await fetch('/api/libros', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ titulo, autor })
        });
        if(res.ok) {
            notify("¡Libro guardado!", "success");
            form.reset();
            obtenerLibros();
        }
    } catch (err) {
        notify("Error al guardar", "error");
    } finally {
        btn.style.opacity = '1';
        btn.disabled = false;
    }
});

async function editarLibro(id) {
    const libro = librosCache.find(l => l.id === id);
    if (!libro) return;

    const nuevoTitulo = prompt("Editar título:", libro.titulo);
    const nuevoAutor = prompt("Editar autor:", libro.autor);

    if (!nuevoTitulo || !nuevoAutor) return;

    try {
        const res = await fetch(`/api/libros/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo: nuevoTitulo, autor: nuevoAutor })
        });
        if (res.ok) {
            notify("Registro actualizado", "success");
            obtenerLibros();
        }
    } catch (e) {
        notify("Error al actualizar", "error");
    }
}

async function eliminarLibro(id) {
    if(!confirm("¿Deseas borrar este registro?")) return;
    try {
        await fetch(`/api/libros/${id}`, { method: 'DELETE' });
        notify("Eliminado", "info");
        obtenerLibros();
    } catch (e) {
        notify("Error al borrar", "error");
    }
}

searchInput.addEventListener('input', filtrarYRenderizar);

function notify(msg, type) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeftColor = type === 'success' ? 'var(--s)' : 'var(--d)';
    toast.innerHTML = `<i class="fas fa-circle-info"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function showLoader(show) {
    show ? loader.classList.remove('hidden') : loader.classList.add('hidden');
    if(show) listaLibros.innerHTML = '';
}

document.addEventListener('DOMContentLoaded', obtenerLibros);