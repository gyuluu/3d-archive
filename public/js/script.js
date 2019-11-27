console.log("sanity check");
(function() {
    Vue.component("image-modal", {
        template: "#image-modal-template",
        props: ["id"],
        data: function() {
            return {
                header: "sassafras <3",
                image: [],
                title: "",
                url: "",
                description: "",
                username: "",
                created_at: "",
                comment: "",
                cusername: "",
                comments: "",
                showNext: true,
                showPrev: true
            };
        },
        mounted: function() {
            var me = this;
            axios
                .get("/image/" + this.id)
                .then(function(response) {
                    me.image = response.data;
                    if (response.data.length == 0) {
                        me.closeModal();
                    } else {
                        if (!me.image[0].next) {
                            me.showNext = false;
                        } else {
                            me.showNext = true;
                        }
                        if (!me.image[0].prev) {
                            me.showPrev = false;
                        } else {
                            me.showPrev = true;
                        }
                    }
                })
                .catch(err => {
                    console.log("error when mounted", err);
                    if (err) {
                        this.showModal = false;
                    }
                });
            axios
                .get("/comments/" + this.id)
                .then(function(response) {
                    me.comments = response.data;
                })
                .catch(err => {
                    console.log(err);
                });
        },
        watch: {
            id: function() {
                var me = this;
                axios
                    .get("/image/" + this.id)
                    .then(function(response) {
                        me.image = response.data;
                        if (response.data.length == 0) {
                            me.closeModal();
                        } else {
                            if (!me.image[0].next) {
                                me.showNext = false;
                            } else {
                                me.showNext = true;
                            }
                            if (!me.image[0].prev) {
                                me.showPrev = false;
                            } else {
                                me.showPrev = true;
                            }
                        }
                    })
                    .catch(err => {
                        console.log("error when mounted", err);
                    });
                axios
                    .get("/comments/" + this.id)
                    .then(function(response) {
                        me.comments = response.data;
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        },
        methods: {
            goback: function() {
                location.hash = "#" + this.image[0].prev;
            },

            gonext: function() {
                location.hash = "#" + this.image[0].next;
            },

            closeModal: function() {
                this.$emit("close");
            },

            handleClick: function(e) {
                e.preventDefault();
                var commentData = {
                    comment: this.comment,
                    username: this.cusername,
                    id: this.id
                };
                var me = this;
                axios
                    .post("/comment", commentData)
                    .then(function(resp) {
                        me.comments.unshift(resp.data[0]);
                    })
                    .catch(function(err) {
                        console.log("err in post /comment: ", err);
                    });
            }
        }
    });

    new Vue({
        el: "#main",
        data: {
            planet: "",
            showModal: false,
            showMore: true,
            name: "Sassafras",
            seen: true,
            images: [],
            id: location.hash.slice(1),
            title: "",
            description: "",
            username: "",
            file: null,
            planets: [
                {
                    id: 1,
                    name: "pluto",
                    funFact: "not a planet"
                },
                {
                    id: 2,
                    name: "earth",
                    funFact: "there are human beings"
                },
                {
                    id: 3,
                    name: "Mars",
                    funFact: "is red and has rovers on it"
                }
            ],
            myClassName: "highlight"
        },

        mounted: function() {
            var me = this;
            axios.get("/images").then(function(response) {
                me.images = response.data;
            });

            addEventListener("hashchange", function() {
                if (
                    location.hash.slice(1) != "" &&
                    !isNaN(location.hash.slice(1))
                ) {
                    me.id = location.hash.slice(1);
                    me.showModal = true;
                } else {
                    me.closeModalOnParent();
                }
            });
        },
        methods: {
            closeModalOnParent: function() {
                location.hash = "";
                this.id = "";
                history.pushState({}, "", "/");
            },
            handleClick: function(e) {
                e.preventDefault();
                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);
                var me = this;
                axios
                    .post("/upload", formData)
                    .then(function(resp) {
                        me.images.unshift(resp.data[0]);
                    })
                    .catch(function(err) {
                        console.log("err in post /upload: ", err);
                    });
            },
            handleChange: function(e) {
                this.file = e.target.files[0];
            },

            handleMore: function(e) {
                e.preventDefault();
                var me = this;
                axios
                    .get("/moreimages/" + me.images[me.images.length - 1].id)
                    .then(function(response) {
                        me.images.push(...response.data);
                        if (
                            response.data[0].lowestId ==
                            me.images[me.images.length - 1].id
                        ) {
                            me.showMore = false;
                        }
                    });
            }
        }
    });
})();
