<script context="module">
  // isStatic = true;
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import logo from "../assets/logo.webp";
  import Text from "./$text.svelte";

  export let props: Props<{}>;

  let { attrs } = props;

  attrs.root_attrs = {
    "data-theme": "my-theme",
  };

  onMount(() => {
    console.log("mounted", props);
  });
</script>

<svelte:head>
  <style>
    html,
    body {
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
    }
  </style>
</svelte:head>

<div class="wrapper">
  <div class="logo-wrapper">
    <!-- svelte-ignore missing-declaration -->
    <img src={asset(logo)} alt="logo" class="logo" />
  </div>

  <Text />
</div>

<style lang="scss">
  .wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .logo-wrapper {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .logo {
        width: 25%;
        animation: pulse 1s ease infinite;
      }

      @keyframes pulse {
        50% {
          transform: scale(105%);
        }
      }
    }
  }
</style>
