using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class UIHandler : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler, IPointerClickHandler
{
    public Image MainImage;
    public TMPro.TextMeshProUGUI MainText;
    public List<Color> Colors;
    public UnityEvent OnAppear;
    public UnityEvent OnHoverStart;
    public UnityEvent OnHoverEnd;
    public UnityEvent OnClick;

    private void OnEnable()
    {
        OnAppear.Invoke();
    }

    public void OnPointerEnter(PointerEventData eventData)
    {
        OnHoverStart.Invoke();
    }

    public void OnPointerExit(PointerEventData eventData)
    {
        OnHoverEnd.Invoke();
    }

    public void OnPointerClick(PointerEventData eventData)
    {
        OnClick.Invoke();
    }

    public void ActivateObject(GameObject go)
    {
        go.SetActive(true);
    }
    
    public void DeactivateObject(GameObject go)
    {
        go.SetActive(false);
    }

    public void ToggleGameObject(GameObject go)
    {
        go.SetActive(!go.activeSelf);
    }

    public void ChangeImageColor(int colorIndex)
    {
        if (MainImage != null)
            MainImage.color = Colors[colorIndex];
    }

    public void ChangeTextColor(int colorIndex)
    {
        if (MainText != null)
            MainText.color = Colors[colorIndex];
    }

    public void ChangeText(string text)
    {
        if (MainText != null)
            MainText.text = text;
    }

    public void OpenWebPage(string url)
    {
        Application.OpenURL(url);
    }
}
