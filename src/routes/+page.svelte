<script lang="ts">
  import { page } from "$app/stores";

  import CalendarIcon from "./Icon.svelte";

  let state: "generated" | "idle" | "error" | "loading" = "idle";

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
      state = "loading";
      const res = await fetch(`/format?ical=${url}`);
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
      <h3>Format your UoM Calendar</h3>
      <input
        bind:value={url}
        type="text"
        placeholder="Your UoM Publish .ics URL"
      />
      <button>
        {#if state === "loading"}
          <span>Loading...</span>
        {:else}
          <span>Generate Formatted Calendar</span>
        {/if}
      </button>
    </form>
    {#if state === "generated" && ics}
      <hr />
      <div class="add">
        <p>
          <a
            target="_blank"
            rel="noreferrer"
            href="webcal://{ics.replace(/^https?:\/\//, ``)}">Add Calendar</a
          >
        </p>
        <divider>or try adding directly to your calendar of choice</divider>
        <div>
          <CalendarIcon
            title="Google"
            url="https://calendar.google.com/calendar/u/0/r?cid=http://{ics.replace(
              /^https?:\/\//,
              ``
            )}"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 256 256"
              ><path
                fill="#FFF"
                d="M195.368 60.632H60.632v134.736h134.736z"
              /><path
                fill="#EA4335"
                d="M195.368 256L256 195.368l-30.316-5.172l-30.316 5.172l-5.533 27.73z"
              /><path
                fill="#188038"
                d="M0 195.368v40.421C0 246.956 9.044 256 20.21 256h40.422l6.225-30.316l-6.225-30.316l-33.033-5.172L0 195.368Z"
              /><path
                fill="#1967D2"
                d="M256 60.632V20.21C256 9.044 246.956 0 235.79 0h-40.422c-3.688 15.036-5.533 26.101-5.533 33.196c0 7.094 1.845 16.24 5.533 27.436c13.41 3.84 23.515 5.76 30.316 5.76c6.801 0 16.906-1.92 30.316-5.76Z"
              /><path
                fill="#FBBC04"
                d="M256 60.632h-60.632v134.736H256z"
              /><path
                fill="#34A853"
                d="M195.368 195.368H60.632V256h134.736z"
              /><path
                fill="#4285F4"
                d="M195.368 0H20.211C9.044 0 0 9.044 0 20.21v175.158h60.632V60.632h134.736V0Z"
              /><path
                fill="#4285F4"
                d="M88.27 165.154c-5.036-3.402-8.523-8.37-10.426-14.94l11.689-4.816c1.06 4.042 2.913 7.175 5.558 9.398c2.627 2.223 5.827 3.318 9.566 3.318c3.823 0 7.107-1.162 9.852-3.487c2.746-2.324 4.127-5.288 4.127-8.875c0-3.672-1.449-6.67-4.345-8.994c-2.897-2.324-6.535-3.486-10.88-3.486h-6.754v-11.57h6.063c3.739 0 6.888-1.011 9.448-3.033c2.56-2.02 3.84-4.783 3.84-8.303c0-3.132-1.145-5.625-3.435-7.494c-2.29-1.87-5.188-2.813-8.708-2.813c-3.436 0-6.164.91-8.185 2.745a16.115 16.115 0 0 0-4.413 6.754l-11.57-4.817c1.532-4.345 4.345-8.185 8.471-11.503c4.127-3.318 9.398-4.985 15.798-4.985c4.733 0 8.994.91 12.767 2.745c3.772 1.836 6.736 4.379 8.875 7.613c2.14 3.25 3.2 6.888 3.2 10.93c0 4.126-.993 7.613-2.98 10.476c-1.988 2.863-4.43 5.052-7.327 6.585v.69a22.248 22.248 0 0 1 9.398 7.327c2.442 3.284 3.672 7.208 3.672 11.79c0 4.58-1.163 8.673-3.487 12.26c-2.324 3.588-5.54 6.417-9.617 8.472c-4.092 2.055-8.69 3.1-13.793 3.1c-5.912.016-11.369-1.685-16.405-5.087Zm71.797-58.005l-12.833 9.28l-6.417-9.734l23.023-16.607h8.825v78.333h-12.598V107.15Z"
              /></svg
            ></CalendarIcon
          >
          <CalendarIcon
            title="Apple"
            url="webcal://{ics.replace(/^https?:\/\//, ``)}"
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="0.82em"
              height="1em"
              viewBox="0 0 256 315"
              ><path
                d="M213.803 167.03c.442 47.58 41.74 63.413 42.197 63.615c-.35 1.116-6.599 22.563-21.757 44.716c-13.104 19.153-26.705 38.235-48.13 38.63c-21.05.388-27.82-12.483-51.888-12.483c-24.061 0-31.582 12.088-51.51 12.871c-20.68.783-36.428-20.71-49.64-39.793c-27-39.033-47.633-110.3-19.928-158.406c13.763-23.89 38.36-39.017 65.056-39.405c20.307-.387 39.475 13.662 51.889 13.662c12.406 0 35.699-16.895 60.186-14.414c10.25.427 39.026 4.14 57.503 31.186c-1.49.923-34.335 20.044-33.978 59.822M174.24 50.199c10.98-13.29 18.369-31.79 16.353-50.199c-15.826.636-34.962 10.546-46.314 23.828c-10.173 11.763-19.082 30.589-16.678 48.633c17.64 1.365 35.66-8.964 46.64-22.262"
              /></svg
            >
          </CalendarIcon>
        </div>
      </div>
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
      margin-top: 10vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      width: clamp(200px, 95%, 30rem);
      hr {
        width: 100%;
        border: 0;
        border-top: 1px solid hsl(0, 0%, 80%);
        padding: 0;
        margin-block: 1rem;
      }
      .add {
        display: flex;
        flex-direction: column;
        width: 100%;
        divider {
          display: grid;
          place-items: center;
          margin-block: 1rem 0.5rem;
        }

        p {
          margin: 0;
          padding: 0;
          a {
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: hsl(152, 50%, 34%);
            border: 1px solid hsl(152, 50%, 28%);
            color: white;
            padding: 0.5rem;
            border-radius: 0.25rem;
            text-decoration: none;
          }
        }
        div {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
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
