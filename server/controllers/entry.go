package controllers

import (
	"github.com/globalsign/mgo/bson"
	"github.com/labstack/echo/v4"
	"github.com/mohemohe/parakeet/server/models"
	"github.com/mohemohe/parakeet/server/util"
	"net/http"
	"strconv"
	"strings"
)

type (
	EntryResponse struct {
		Entry *models.Entry `json:"entry"`
	}

	EntriesResponse struct {
		Entries *[]models.Entries `json:"entries"`
	}
)

func GetEntries(c echo.Context) error {
	limit, err := strconv.Atoi(c.QueryParam("limit"))
	if err != nil {
		limit = 5
	}
	page, err := strconv.Atoi(c.QueryParam("page"))
	if err != nil {
		page = 1
	}
	includeDraft := c.Get("User") != nil

	entry := models.GetEntries(limit, page, includeDraft)
	if entry == nil {
		panic("db error")
	}

	return c.JSON(http.StatusOK, entry)
}

func GetEntry(c echo.Context) error {
	id := c.Param("id")
	includeDraft := c.Get("User") != nil

	entry := models.GetEntryById(id, includeDraft)
	if entry == nil {
		return c.NoContent(http.StatusNotFound)
	}
	return c.JSON(http.StatusOK, EntryResponse{
		Entry: entry,
	})
}

func UpsertEntry(c echo.Context) error {
	entry := new(models.Entry)
	if err := c.Bind(entry); err != nil {
		panic("bind error")
	}
	user := c.Get("User").(*models.User)
	entry.Author = user.Id

	enableNotify := false

	id := c.Param("id")
	if id == "" || id == "undefined" {
		enableNotify = true
	} else {
		current := models.GetEntryById(id, true)
		if current != nil {
			entry.Id = current.Id
			entry.Created = current.Created
			entry.SetIsNew(false) // HACK: force update
			if current.Draft && !entry.Draft {
				enableNotify = true
			}
		}
	}

	if err := models.UpsertEntry(entry); err != nil {
		enableNotify = false
		panic(err)
	}

	if entry.Draft {
		enableNotify = false
	}

	if enableNotify {
		kv := models.GetKVS("notify_mastodon")
		if kv != nil {
			notifyMastodon := kv.Value.(bson.M)
			if notifyMastodon["baseurl"] != "" && notifyMastodon["token"] != "" && notifyMastodon["template"] != "" {
				status := notifyMastodon["template"].(string)
				status = strings.ReplaceAll(status, "%ENTRY_TITLE%", entry.Title)
				status = strings.ReplaceAll(status, "%ENTRY_URL%", c.Scheme()+"://"+c.Request().Host+"/entry/"+entry.Id.Hex())
				go util.PostMastodon(status, notifyMastodon["baseurl"].(string), notifyMastodon["token"].(string))
			}
		}
	}

	return c.JSON(http.StatusOK, EntryResponse{
		Entry: entry,
	})
}

func DeleteEntry(c echo.Context) error {
	id := c.Param("id")
	entry := models.GetEntryById(id, true)
	if entry == nil {
		panic("the user not found")
	}

	if err := models.DeleteEntry(entry); err != nil {
		panic(err)
	}

	return c.JSON(http.StatusOK, struct{}{})
}
