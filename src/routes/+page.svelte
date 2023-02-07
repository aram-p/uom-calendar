<script lang="ts">
  import { page } from "$app/stores";

  let state: "generated" | "idle" | "error" = "idle";

  let ics: string | undefined;

  let url: string;

  async function handleSubmit(
    e: Event & {
      readonly submitter: HTMLElement | null;
    } & {
      currentTarget: EventTarget & HTMLFormElement;
    }
  ) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch .ics file");
      state = "generated";
      ics = `${$page.url.origin}/format?ical=${url}`;
    } catch (error) {
      state = "error";
    }
  }
</script>

<wrapper>
  <main>
    <form on:submit|preventDefault={handleSubmit}>
      <h3>Generate .ics URL</h3>
      <input
        bind:value={url}
        type="text"
        placeholder="Your UoM Publish .ics URL"
      />
      <button>Generate</button>
    </form>
    {#if state === "generated"}
      <p>
        <a href={ics} download>Download .ics file</a>
      </p>
    {:else if state === "error"}
      <p style="color: red">Failed to generate .ics file, try again.</p>
    {/if}
  </main>
</wrapper>

<style lang="scss">
  wrapper {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    display: grid;
    place-items: center;
    main {
      padding: 1rem;
      width: clamp(200px, 95%, 20rem);
      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        h3 {
          margin: 0;
          padding: 0;
          font-size: 1.5rem;
          font-weight: 500;
        }
        input {
          margin: 0;
          padding: 0.5rem;
          border: 1px solid hsl(0, 0%, 80%);
          border-radius: 0.25rem;
          font-size: 1rem;
          &:focus {
            outline: none;
            border-color: hsl(0, 0%, 50%);
          }
          transition: 150ms ease-in-out;
        }
        button {
          margin: 0;
          padding: 0.5rem;
          border: 1px solid hsl(0, 0%, 80%);
          border-radius: 0.25rem;
          font-size: 1rem;
          cursor: pointer;
          outline: 0;
          &:hover {
            background-color: hsl(0, 0%, 90%);
          }
          &:focus {
            background-color: hsl(0, 0%, 90%);
            border-color: hsl(0, 0%, 60%);
          }
          transition: 150ms ease-in-out;
        }
      }
    }
  }
</style>
