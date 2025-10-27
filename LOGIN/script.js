const conta = document.getElementsByClassName('btn-login');
const emailInput = document.querySelector('.email');
const senhaInput = document.querySelector('.senha');



function salvar_conta() {
    localStorage.setItem("EmailSalvo", emails);
    localStorage.setItem("SenhasSalvo", senhas);
}

function mostrarNome() {
    const nomeSalvo = localStorage.getItem("EmailSalvo");
    document.getElementById("resultado").innerText = nomeSalvo
      ? `Olá, ${nomeSalvo}!`
      : "Nenhum nome salvo ainda.";
}

