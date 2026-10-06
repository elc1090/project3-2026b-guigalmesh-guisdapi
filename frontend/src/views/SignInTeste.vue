<script setup>

const cadastrarUsuario = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/diagnostico', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(respostas.value)
    })

    // Captura a resposta do back-end e atualiza a tela
    const data = await response.json()
    resultado.value = data

  } catch (erro) {
    console.error("Erro de comunicação com o Back-end:", erro)
  }
}

</script>

<template>
    <div>Sign Up</div>
    <form>
        <label for="fname">E-mail:</label><br>
        <input type="text">
        <label for="fname">Password:</label><br>
        <input type="text">
    </form>
</template>
