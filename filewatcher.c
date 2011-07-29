#include <sys/inotify.h>
#include <stdio.h>
#include <unistd.h>

#define WATCHBUF 8192
#define EVENTBUF 1024

typedef struct inotify_event event_t;

const int EVENTS = IN_ATTRIB|IN_CREATE|IN_DELETE|IN_MODIFY|IN_MOVED_FROM|IN_MOVED_TO;

main() {
  int fd = inotify_init();
  int watched[WATCHBUF+1]; // +1 to simplify remove loop

  if (fd<0) perror("inotify_init");

  watched[0] = inotify_add_watch(fd, "data", EVENTS);
  int watchedcount = 1;

  int cursize = 0;
  event_t buffer[1024];

  printf("starting to watch for changes to data\n");
  while (1) {
    cursize = read(fd, buffer, sizeof(event_t)*1024);

    if (cursize<0) perror("read");

    for (int i=0;i<(cursize/sizeof(event_t));i++) {
      int wd = buffer[i].wd;
      int mask = buffer[i].mask;
      char *name = buffer[i].name;

      if (mask & IN_CREATE) {
	if (mask & IN_ISDIR) {
	  // Subdir created, watch it
	  if (watchedcount == WATCHBUF) {
	    fprintf(stderr, "error: Maxed out watch list!  Not watching");
	  } else {
	    watched[watchedcount++] = inotify_add_watch(fd, name, EVENTS);
	    printf("Watching new subdir '%s'.\n", name);
	  }
	} else {
	  printf("New file '%s'.\n", name);
	}
      } else if (mask & IN_DELETE) {
	if (mask & IN_ISDIR) {
	  // Subdir deleted, stop watching it 
	  inotify_rm_watch(fd, wd);
	  int j=0; 
	  while (watched[j++] != wd);
	  while (j <= watchedcount) watched[j-1] = watched[j];
	  watchedcount--;
	} else {
	  printf("Deleted file '%s'.\n", name);
	}
      }
    }
  }

  // Clean up
  for (int i=0;i<watchedcount;i++)
    inotify_rm_watch(fd, watched[i]);
  close(fd);
}
