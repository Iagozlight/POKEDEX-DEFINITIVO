const conta = document.getElementsByClassName('btn-login');
const emailInput = document.querySelector('.email');
const senhaInput = document.querySelector('.senha');

function salvar_conta() {
    const email = emailInput.value;
    const senha = senhaInput.value;

    localStorage.setItem("EmailSalvo", email);
    localStorage.setItem("SenhaSalva", senha);

    alert("Conta salva com sucesso!");
}

function mostrarNome() {
    const nomeSalvo = localStorage.getItem("EmailSalvo");
    document.getElementById("resultado").innerText = nomeSalvo
      ? `Olá, ${nomeSalvo}!`
      : "Nenhum nome salvo ainda.";
}
