import {KeyboardEvent as ReactKeyboardEvent,useEffect} from 'react'

const focusable='button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[href],[tabindex]:not([tabindex="-1"])'

function keepFocusInside(event:KeyboardEvent|ReactKeyboardEvent<HTMLElement>,dialog:HTMLElement){
  if(event.key!=='Tab')return
  const items=Array.from(dialog.querySelectorAll<HTMLElement>(focusable))
  if(!items.length)return
  const first=items[0]
  const last=items.at(-1)!
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
}

export function useDialog(onClose:()=>void){
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null
    const dialog=document.querySelector<HTMLElement>('.modal-back:last-of-type .modal')
    if(dialog){
      dialog.setAttribute('role','dialog')
      dialog.setAttribute('aria-modal','true')
      const title=dialog.querySelector<HTMLElement>('h1,h2,h3')
      if(title&&!dialog.hasAttribute('aria-labelledby')){
        title.id||=`dialog-title-${crypto.randomUUID()}`
        dialog.setAttribute('aria-labelledby',title.id)
      }
    }
    const handleKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape')onClose()
      else if(dialog)keepFocusInside(event,dialog)
    }
    addEventListener('keydown',handleKey)
    return()=>{removeEventListener('keydown',handleKey);previous?.focus()}
  },[onClose])

  return(event:ReactKeyboardEvent<HTMLElement>)=>{
    if(event.key==='Escape'){event.preventDefault();return}
    keepFocusInside(event,event.currentTarget)
  }
}
