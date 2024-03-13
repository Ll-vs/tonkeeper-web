import { FC, useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAppContext } from '../../hooks/appContext';
import { useTranslation } from '../../hooks/translation';
import { scrollToTop } from '../../libs/common';
import { AppProRoute, AppRoute } from '../../libs/routes';
import { useMutateActiveWallet } from '../../state/account';
import { useWalletState } from '../../state/wallet';
import { PlusIcon, SlidersIcon, StatsIcon } from '../Icon';
import { Body2 } from '../Text';
import { ImportNotification } from '../create/ImportNotification';
import { SubscriptionInfo } from './SubscriptionInfo';
import { WalletEmoji } from '../shared/emoji/WalletEmoji';
import { useIsScrolled } from '../../hooks/useIsScrolled';

const AsideContainer = styled.div`
    height: 100%;
    box-sizing: border-box;

    background: ${p => p.theme.backgroundContent};
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0.5rem 0;
`;

const ScrollContainer = styled.div`
    overflow: auto;
`;

const DividerStyled = styled.div<{ isHidden?: boolean }>`
    opacity: ${p => (p.isHidden ? 0 : 1)};
    height: 1px;
    background-color: ${p => p.theme.separatorCommon};
    margin: 0 -0.5rem;
    width: calc(100% + 1rem);

    transition: opacity 0.15s ease-in-out;
`;

const IconWrapper = styled.div`
    color: ${p => p.theme.iconSecondary};
    height: fit-content;

    > svg {
        display: block;
    }
`;

const AsideMenuCard = styled.button<{ isSelected: boolean }>`
    background: ${p => (p.isSelected ? p.theme.backgroundContentTint : p.theme.backgroundContent)};
    border-radius: ${p => p.theme.corner2xSmall};

    padding: 6px 10px;
    width: 100%;
    height: 36px;
    min-height: 36px;
    display: flex;
    align-items: center;
    gap: 10px;

    & > ${Body2} {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    transition: background-color 0.2s ease-in-out;

    &:hover {
        background: ${p => p.theme.backgroundContentTint};
    }
`;

const AsideMenuBottom = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    background: ${p => p.theme.backgroundContent};
    padding-bottom: 0.5rem;

    & > ${AsideMenuCard}:nth-child(2) {
        margin-top: 0.5rem;
    }
`;

export const AsideMenuAccount: FC<{ publicKey: string; isSelected: boolean }> = ({
    publicKey,
    isSelected
}) => {
    const { t } = useTranslation();
    const { data: wallet } = useWalletState(publicKey);
    const { mutate } = useMutateActiveWallet();
    const navigate = useNavigate();

    const { account } = useAppContext();
    const shouldShowIcon = account.publicKeys.length > 1;

    const handleNavigateHome = useCallback(() => {
        if (location.pathname !== AppRoute.home) {
            return navigate(AppRoute.home);
        } else {
            scrollToTop();
        }
    }, [location.pathname]);

    const onClick = useCallback(() => {
        mutate(publicKey);
        handleNavigateHome();
    }, [publicKey, mutate, handleNavigateHome]);

    if (!wallet) {
        return null;
    }

    const name = wallet.name ? wallet.name : t('wallet_title');

    return (
        <AsideMenuCard isSelected={isSelected} onClick={onClick}>
            {shouldShowIcon && (
                <WalletEmoji emojiSize="16px" containerSize="16px" emoji={wallet.emoji} />
            )}
            <Body2>{name}</Body2>
        </AsideMenuCard>
    );
};

export const AsideMenu: FC<{ className?: string }> = ({ className }) => {
    const { t } = useTranslation();
    const [isOpenImport, setIsOpenImport] = useState(false);
    const { account, proFeatures } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const { ref, closeBottom } = useIsScrolled();

    const activeRoute = useMemo<string | undefined>(() => {
        if (location.pathname.startsWith(AppProRoute.dashboard)) {
            return AppProRoute.dashboard;
        }

        if (location.pathname.startsWith(AppRoute.settings)) {
            return AppRoute.settings;
        }

        return undefined;
    }, [location.pathname]);

    const handleNavigateClick = useCallback(
        (route: string) => {
            if (location.pathname !== route) {
                return navigate(route);
            } else {
                scrollToTop();
            }
        },
        [location.pathname]
    );

    return (
        <AsideContainer className={className}>
            <ScrollContainer ref={ref}>
                {proFeatures && (
                    <AsideMenuCard
                        isSelected={activeRoute === AppProRoute.dashboard}
                        onClick={() => handleNavigateClick(AppProRoute.dashboard)}
                    >
                        <StatsIcon />
                        <Body2>{t('aside_dashboard')}</Body2>
                    </AsideMenuCard>
                )}
                {account.publicKeys.map(publicKey => (
                    <AsideMenuAccount
                        key={publicKey}
                        publicKey={publicKey}
                        isSelected={
                            !activeRoute &&
                            !!account.activePublicKey &&
                            account.activePublicKey === publicKey
                        }
                    />
                ))}
            </ScrollContainer>
            <AsideMenuBottom>
                <DividerStyled isHidden={!closeBottom} />
                <AsideMenuCard isSelected={false} onClick={() => setIsOpenImport(true)}>
                    <IconWrapper>
                        <PlusIcon />
                    </IconWrapper>
                    <Body2>{t('aside_add_wallet')}</Body2>
                </AsideMenuCard>
                <AsideMenuCard
                    onClick={() => handleNavigateClick(AppRoute.settings)}
                    isSelected={activeRoute === AppRoute.settings}
                >
                    <IconWrapper>
                        <SlidersIcon />
                    </IconWrapper>
                    <Body2>{t('aside_settings')}</Body2>
                </AsideMenuCard>
                <SubscriptionInfo />
            </AsideMenuBottom>
            <ImportNotification isOpen={isOpenImport} setOpen={setIsOpenImport} />
        </AsideContainer>
    );
};
