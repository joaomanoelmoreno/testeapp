// app.js

function normalize(text) {
  return text.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function getPratosSalvos() {
  const pratos = localStorage.getItem("pratos");
  return pratos ? JSON.parse(pratos) : [];
}

const bancoIngredientes = [
  { nome: "filé mignon", beneficios: "rico em proteínas, fonte de ferro" },
  { nome: "creme de leite", beneficios: "fonte de energia e cálcio" },
  { nome: "cebola", beneficios: "ação anti-inflamatória e antioxidante" },
  { nome: "alho", beneficios: "fortalece o sistema imunológico" },
  { nome: "sal", beneficios: "essencial em pequenas quantidades" },
  { nome: "óleo", beneficios: "fonte de gorduras essenciais" },
];

function obterBeneficiosAutomaticos(ingredientes, banco) {
  const beneficios = new Set();
  ingredientes.forEach(ing => {
    const info = banco.find(item => normalize(item.nome) === normalize(ing));
    if (info && info.beneficios) beneficios.add(info.beneficios);
  });
  return Array.from(beneficios).join(", ");
}

function exibirInformacoes(prato) {
  const infoArea = document.getElementById("infoArea");
  infoArea.innerHTML = `
    <div><strong>Nome:</strong> ${prato.nome}</div>
    <div><strong>Ingredientes:</strong> ${prato.ingredientes.join(", ")}</div>
    <div><strong>Alérgenos:</strong> ${prato.alergenos.join(", ")}</div>
    <div><strong>Categorias:</strong> ${prato.categorias.join(", ")}</div>
    <div><strong>Descrição:</strong> ${prato.descricao || "-"}</div>
    <div><strong>Benefícios à saúde:</strong> ${obterBeneficiosAutomaticos(prato.ingredientes, bancoIngredientes)}</div>
    <div><strong>Informações nutricionais:</strong> ${prato.infoNutricionais || "-"}</div>
    <div><strong>Fotos:</strong><br>${(prato.fotos || []).map(f => `<img src="${f}" width="120" style="margin:5px; border-radius:12px;">`).join("")}</div>
  `;
}

// OCR ao vivo com câmera
async function iniciarCameraComOCR() {
  const video = document.getElementById("video");
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  const realizarOCR = async () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const { data: { text } } = await Tesseract.recognize(canvas, "por");
    const textoReconhecido = normalize(text);
    console.log("OCR ao vivo:", textoReconhecido);

    const pratos = getPratosSalvos();
    const prato = pratos.find(p => normalize(p.nome) === textoReconhecido);
    if (prato) {
      exibirInformacoes(prato);
    }

    setTimeout(realizarOCR, 2500); // repete OCR a cada 2,5 segundos
  };

  video.onloadedmetadata = () => {
    realizarOCR();
  };
}

iniciarCameraComOCR();
