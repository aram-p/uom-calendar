<script lang="ts">
  export let url: string;
  export let title: string;
</script>

<a class="icon" href={url}>
  <slot />
  <p>{title}</p>
</a>

<style lang="scss">
  a {
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    gap: 0.25rem;
    padding: 0.5rem 1.5rem;
    border-radius: 0.25rem;
    // border: 1px solid hsl(0, 0%, 93%);
    // background-color: hsl(0, 0%, 98%);
    text-decoration: none;
    &:hover {
      // background-color: hsl(0, 0%, 93%);
      // border-color: hsl(0, 0%, 88%);
      text-decoration: underline;
      text-decoration-thickness: 0.5px;
      text-decoration-color: hsl(0, 0%, 40%);
    }
    transition: 150ms ease-in-out;
    p {
      display: flex;
      justify-content: center;
      max-width: 100%;
      padding: 0;
      margin: 0;
      color: black;
    }
  }
  :global(a.icon > svg) {
    width: 100%;
    height: 100%;
  }
</style>
