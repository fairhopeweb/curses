import { appWindow } from "@tauri-apps/api/window";
import classNames from "classnames";
import { FC, HtmlHTMLAttributes, PropsWithChildren, ReactNode, useState } from "react";
import { RiChatVoiceFill, RiMicFill, RiMicOffFill, RiPushpin2Fill, RiPushpinFill, RiUserVoiceFill, RiVolumeMuteFill, RiVolumeUpFill } from "react-icons/ri";
import { RxInput } from "react-icons/rx";
import { VscChromeClose, VscChromeMaximize, VscChromeMinimize } from "react-icons/vsc";
import { useSnapshot }         from "valtio";
import { ServiceNetworkState } from "../../types";
import Tooltip                 from "./dropdown/Tooltip";
import Logo                    from "./logo";

const Divider: FC = () => {
  return <div className="flex-none h-4 w-1 bg-neutral rounded-full"></div>
}

const Button: FC<PropsWithChildren<HtmlHTMLAttributes<HTMLButtonElement> & { tooltip: string, body?: ReactNode }>> = ({ tooltip, body, children, className = "btn-ghost", ...rest }) => {
  return <Tooltip content={tooltip} body={body}>
    <button {...rest} className={classNames("btn h-10 min-h-fit text-xl w-10 btn-square flex items-center justify-center", className)}>{children}</button>
  </Tooltip>
}

const ButtonService: FC<PropsWithChildren<HtmlHTMLAttributes<HTMLButtonElement> & { status: ServiceNetworkState, tooltip: string, body?: ReactNode }>> = ({ status, tooltip, body, children, ...rest }) => {
  const classes = status === ServiceNetworkState.connected ? "btn-success" : status === ServiceNetworkState.connecting ? "btn-neutral" : "btn-ghost"
  return <Tooltip className="flex-none" content={tooltip} body={status}>
    <button {...rest} className={classNames("btn border-2 h-10 min-h-fit text-xl w-10 btn-square flex items-center justify-center", classes, { "loading": status === ServiceNetworkState.connecting })}>
      {status !== ServiceNetworkState.connecting && children}
    </button>
  </Tooltip>
}


const handleSwitchFullscreenInput = () => window.ApiServer.state.showOverlay = !window.ApiServer.state.showOverlay;
const handleSwitchMuteSTT = () => window.ApiServer.stt.serviceState.muted = !window.ApiServer.stt.serviceState.muted;
const handleSwitchSoundEffects = () => window.ApiServer.state.muteSoundEffects = !window.ApiServer.state.muteSoundEffects;
const handleSwitchSTT = () => {
  if (window.ApiServer.stt.serviceState.status === ServiceNetworkState.disconnected)
    window.ApiServer.stt.start();
  else if (window.ApiServer.stt.serviceState.status === ServiceNetworkState.connected)
    window.ApiServer.stt.stop();
}
const handleSwitchTTS = () => {
  if (window.ApiServer.tts.serviceState.status === ServiceNetworkState.disconnected)
    window.ApiServer.tts.start();
  else if (window.ApiServer.tts.serviceState.status === ServiceNetworkState.connected)
    window.ApiServer.tts.stop();
}

const ActionBar: FC = () => {
  return <div data-tauri-drag-region className="relative w-full py-1 flex items-center space-x-1 sm:space-x-2 px-2">
    <div className="w-full pointer-events-none font-black text-2xl align-middle leading-tight font-header">
      <span className="hidden sm:block text-sm">
        <Logo/>
      </span>
      </div>
    <AppActions />
    <div className="pointer-events-none w-full flex justify-end">
      <WindowActions />
    </div>
  </div>
}

const AppActions: FC = () => {
  const { muted: sttMute, status: sttStatus } = useSnapshot(window.ApiServer.stt.serviceState);
  const { muteSoundEffects: vfxMute } = useSnapshot(window.ApiServer.state);
  const { status: ttsStatus } = useSnapshot(window.ApiServer.tts.serviceState);

  const { showActionButton: sttButton } = useSnapshot(window.ApiServer.state.services.stt);
  const { showActionButton: ttsButton } = useSnapshot(window.ApiServer.state.services.tts);

  return <div className="flex flex-none items-center space-x-0 sm:space-x-2">
    <Button tooltip="Fullscreen input" onClick={handleSwitchFullscreenInput} ><RxInput /></Button>
    <Button className={vfxMute ? "btn-error" : "btn-ghost"} tooltip="Mute sound effects" body={<>Mute effects like text typing sound <b>in this window</b>. <br /> Does not affect text-to-speech</>} onClick={handleSwitchSoundEffects}>{vfxMute ? <RiVolumeMuteFill /> : <RiVolumeUpFill />}</Button>
    <Button className={sttMute ? "btn-error" : "btn-ghost"} tooltip="Mute speech to text" body="Prevents speech-to-text from sending any output" onClick={handleSwitchMuteSTT}>
      {sttMute ? <RiMicOffFill /> : <RiMicFill />}
    </Button>
    {(sttButton || ttsButton) && <Divider />}
    {sttButton && <ButtonService status={sttStatus} tooltip="Speech to text" onClick={handleSwitchSTT} ><RiUserVoiceFill /></ButtonService>}
    {ttsButton && <ButtonService status={ttsStatus} tooltip="Text to speech" onClick={handleSwitchTTS} ><RiChatVoiceFill /></ButtonService>}
  </div>
}

const WindowActions: FC = () => {
  const handleMinimize = () => window.Config.isApp() && appWindow.minimize();
  const handleMaximize = async () => {
    const state = await appWindow.isMaximized();
    state ? appWindow.unmaximize() : appWindow.maximize();
  };

  const [alwaysOnTop, setAlwaysOnTop] = useState(false);

  const handlePin = async () => {
    await appWindow.setAlwaysOnTop(!alwaysOnTop)
    setAlwaysOnTop(!alwaysOnTop);
  }

  const handleClose = () => appWindow.close();

  return <div className="flex z-0 pointer-events-auto items-center space-x-2">
    <Button tooltip={alwaysOnTop ? "Unpin window" : "Pin window on top"} onClick={handlePin}>{alwaysOnTop ? <RiPushpin2Fill /> : <RiPushpinFill />}</Button>
    <button className="btn btn-ghost btn-sm btn-square" onClick={handleMinimize}><VscChromeMinimize /></button>
    <button className="btn btn-ghost btn-sm btn-square" onClick={handleMaximize}><VscChromeMaximize /></button>
    <button className="btn btn-ghost btn-sm btn-square" onClick={handleClose}><VscChromeClose /></button>
  </div>
}

export default ActionBar;
